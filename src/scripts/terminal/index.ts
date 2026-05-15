// /play terminal driver: wires the prompt, history, input, and command dispatch.
//
// Stub counter:
// TODO(backend): when a Cloudflare Worker + KV is provisioned, POST the win
// event to /api/play/solve. The Worker validates and returns the real global
// count. For now we offset a localStorage counter by 7 so the first solver
// sees "#8" — honest enough as a stub, marked for replacement.

import type { CommandContext, TerminalState } from './types';
import { COMMANDS } from './commands';
import { formatPwd } from './filesystem';
import { LEVELS, getLevel } from './levels';

const PROMPT = (level: number, cwd: string) => `visitor@wispy[L${level}]:${cwd}$ `;
const STORAGE_KEY = 'mywispy-play-state';
const COUNTER_KEY = 'mywispy-play-count';
const SOLVED_KEY = 'mywispy-play-solved';
const STUB_OFFSET = 7; // displayed = stored + offset, to feel like a real backend count

interface StoredProgress {
  highestLevel: number;
  solved: boolean;
}

function readProgress(): StoredProgress {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (v && typeof v.highestLevel === 'number') return v as StoredProgress;
  } catch {
    /* ignore */
  }
  return { highestLevel: 1, solved: false };
}

function writeProgress(p: StoredProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore — incognito etc */
  }
}

function recordSolve(): number {
  // Returns the displayed solver number.
  try {
    if (localStorage.getItem(SOLVED_KEY) === 'true') {
      return (parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10) || 0) + STUB_OFFSET;
    }
    const next = (parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10) || 0) + 1;
    localStorage.setItem(COUNTER_KEY, String(next));
    localStorage.setItem(SOLVED_KEY, 'true');
    return next + STUB_OFFSET;
  } catch {
    return STUB_OFFSET + 1;
  }
}

export function mountTerminal(root: HTMLElement): void {
  const out = root.querySelector<HTMLElement>('[data-term-output]');
  const promptEl = root.querySelector<HTMLElement>('[data-term-prompt]');
  const inputEl = root.querySelector<HTMLInputElement>('[data-term-input]');
  const cursorEl = root.querySelector<HTMLElement>('[data-term-cursor]');
  const liveEl = root.querySelector<HTMLElement>('[data-term-live]');
  if (!out || !promptEl || !inputEl || !cursorEl || !liveEl) return;

  // --- state -----------------------------------------------------------
  const progress = readProgress();
  const state: TerminalState = {
    cwd: [],
    level: progress.highestLevel,
    history: [],
    historyIdx: -1,
    completed: progress.solved,
  };

  // --- output helpers --------------------------------------------------
  function print(line: string): void {
    if (line === '\x00CLEAR\x00') {
      out!.innerHTML = '';
      return;
    }
    const div = document.createElement('div');
    div.textContent = line;
    div.className = 'term__line';
    out!.appendChild(div);
  }

  function printRaw(html: string): void {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.className = 'term__line';
    out!.appendChild(div);
  }

  function printCommandEcho(cmd: string): void {
    const lev = getLevel(state.level);
    const div = document.createElement('div');
    div.className = 'term__line term__line--echo';
    const p = document.createElement('span');
    p.className = 'term__prompt-echo';
    p.textContent = PROMPT(lev!.id, formatPwd(state.cwd));
    div.appendChild(p);
    const c = document.createElement('span');
    c.textContent = cmd;
    div.appendChild(c);
    out!.appendChild(div);
  }

  function scrollToBottom(): void {
    out!.scrollTop = out!.scrollHeight;
  }

  function updatePrompt(): void {
    const lev = getLevel(state.level);
    if (!lev) return;
    promptEl!.textContent = PROMPT(lev.id, formatPwd(state.cwd));
  }

  function updateLiveLine(): void {
    liveEl!.textContent = inputEl!.value;
  }

  // --- level transitions ----------------------------------------------
  function advance(toLevel: number): void {
    const lev = getLevel(toLevel);
    if (!lev) return;
    state.level = toLevel;
    state.cwd = [];
    progress.highestLevel = Math.max(progress.highestLevel, toLevel);
    writeProgress(progress);
    for (const line of lev.welcome) print(line);
    updatePrompt();
  }

  function win(): void {
    const n = recordSolve();
    progress.solved = true;
    state.completed = true;
    writeProgress(progress);
    print('');
    print('============================================================');
    print('');
    print(`  congratulations. you are solver #${n}.`);
    print('');
    print('  if you are a senior engineer, i would love to work with');
    print('  you. send a note to luis@mywispy.com — subject line:');
    print('  "wispy solver" — and mention which level was your favourite.');
    print('');
    print('============================================================');
    print('');
  }

  // --- boot ------------------------------------------------------------
  const startLevel = getLevel(state.level) ?? LEVELS[0];
  state.level = startLevel.id;
  for (const line of startLevel.welcome) print(line);
  if (state.completed) {
    print('');
    print('(you have completed this CTF on this device — replay welcome.)');
  }
  updatePrompt();

  // --- input handling --------------------------------------------------
  async function runCommand(raw: string): Promise<void> {
    const cmd = raw.trim();
    printCommandEcho(raw);
    if (cmd === '') return;
    state.history.push(cmd);
    state.historyIdx = state.history.length;

    const [name, ...args] = cmd.split(/\s+/);
    const fn = COMMANDS[name];
    if (!fn) {
      print(`${name}: command not found. try \`help\`.`);
      return;
    }
    const ctx: CommandContext = {
      state,
      level: getLevel(state.level)!,
      print,
      printRaw,
      advance,
      win,
    };
    try {
      await fn(args, ctx);
    } catch (err) {
      print(`${name}: error — ${(err as Error).message}`);
    }
  }

  inputEl.addEventListener('input', updateLiveLine);

  inputEl.addEventListener('keydown', async (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      const value = inputEl.value;
      inputEl.value = '';
      updateLiveLine();
      await runCommand(value);
      scrollToBottom();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (state.history.length === 0) return;
      state.historyIdx = Math.max(0, state.historyIdx - 1);
      inputEl.value = state.history[state.historyIdx] ?? '';
      updateLiveLine();
    } else if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (state.historyIdx >= state.history.length - 1) {
        state.historyIdx = state.history.length;
        inputEl.value = '';
      } else {
        state.historyIdx++;
        inputEl.value = state.history[state.historyIdx] ?? '';
      }
      updateLiveLine();
    } else if (ev.key === 'l' && ev.ctrlKey) {
      ev.preventDefault();
      out.innerHTML = '';
    }
  });

  // Click anywhere in the terminal to refocus the (visually hidden) input.
  root.addEventListener('click', () => {
    inputEl.focus();
  });
  inputEl.focus();
}
