// /play terminal driver: wires the prompt, history, input, and command dispatch.

import type { CommandContext, TerminalState } from './types';
import { COMMANDS } from './commands';
import { formatPwd } from './filesystem';
import { LEVELS, getLevel } from './levels';

const PROMPT = (level: number, cwd: string) => `visitor@wispy[L${level}]:${cwd}$ `;
const STORAGE_KEY = 'mywispy-play-state';
const SOLVED_KEY = 'mywispy-play-solved';
const COUNTER_KEY = 'mywispy-play-count';

// Set after `wrangler deploy` in worker/. Empty = no backend, local count only.
const SOLVE_ENDPOINT = 'https://wispy-play-solve.luispazzanese.workers.dev/solve';

const FLAG = 'flagship';

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

function readLocalCount(): number {
  return parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10) || 0;
}

function writeLocalCount(n: number): void {
  try {
    localStorage.setItem(COUNTER_KEY, String(n));
    localStorage.setItem(SOLVED_KEY, 'true');
  } catch {
    /* ignore */
  }
}

async function submitSolve(comment: string): Promise<number | null> {
  if (!SOLVE_ENDPOINT) return null;
  try {
    const res = await fetch(SOLVE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag: FLAG, comment }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { count?: number };
    return typeof data.count === 'number' ? data.count : null;
  } catch {
    return null;
  }
}

export function mountTerminal(root: HTMLElement): void {
  const out = root.querySelector<HTMLElement>('[data-term-output]');
  const promptEl = root.querySelector<HTMLElement>('[data-term-prompt]');
  const inputEl = root.querySelector<HTMLInputElement>('[data-term-input]');
  const liveEl = root.querySelector<HTMLElement>('[data-term-live]');
  if (!out || !promptEl || !inputEl || !liveEl) return;

  const progress = readProgress();
  const state: TerminalState = {
    cwd: [],
    level: progress.highestLevel,
    history: [],
    historyIdx: -1,
    completed: progress.solved,
  };

  // 'comment' mode captures the next line as the solver's optional note rather
  // than dispatching it as a command. Set by win(), cleared after submit.
  let inputMode: 'command' | 'comment' = 'command';

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
    const lev = getLevel(state.level)!;
    const div = document.createElement('div');
    div.className = 'term__line term__line--echo';
    const p = document.createElement('span');
    p.className = 'term__prompt-echo';
    p.textContent =
      inputMode === 'comment' ? '> ' : PROMPT(lev.id, formatPwd(state.cwd));
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
    promptEl!.textContent =
      inputMode === 'comment' ? '> ' : PROMPT(lev.id, formatPwd(state.cwd));
  }

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

  function printRecruitmentFlag(n: number): void {
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

  // win() runs the unlock → comment-prompt → submit flow. The actual count
  // and recruitment message are printed in finishWin() after the comment line.
  function win(): void {
    if (state.completed) {
      // Replays don't re-fire the notification. Just print the flag again.
      printRecruitmentFlag(readLocalCount() || 1);
      return;
    }
    print('');
    print('leave a note? (optional — name, linkedin, "hello", anything.');
    print('press enter to skip.)');
    inputMode = 'comment';
    updatePrompt();
  }

  async function finishWin(comment: string): Promise<void> {
    inputMode = 'command';
    updatePrompt();

    if (comment) {
      print('submitting…');
    }
    const remoteCount = await submitSolve(comment);

    let n: number;
    if (remoteCount !== null) {
      n = remoteCount;
    } else {
      n = readLocalCount() + 1;
      print('(offline — couldn\'t reach the solve server. counted locally.)');
    }
    writeLocalCount(n);
    progress.solved = true;
    state.completed = true;
    writeProgress(progress);

    printRecruitmentFlag(n);
  }

  const startLevel = getLevel(state.level) ?? LEVELS[0];
  state.level = startLevel.id;
  for (const line of startLevel.welcome) print(line);
  if (state.completed) {
    print('');
    print('(you have completed this CTF on this device — replay welcome.)');
  }
  updatePrompt();

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

  inputEl.addEventListener('input', () => {
    liveEl!.textContent = inputEl.value;
  });

  inputEl.addEventListener('keydown', async (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      const value = inputEl.value;
      inputEl.value = '';
      liveEl!.textContent = '';
      if (inputMode === 'comment') {
        printCommandEcho(value);
        await finishWin(value.trim());
      } else {
        await runCommand(value);
      }
      scrollToBottom();
    } else if (ev.key === 'ArrowUp' && inputMode === 'command') {
      ev.preventDefault();
      if (state.history.length === 0) return;
      state.historyIdx = Math.max(0, state.historyIdx - 1);
      inputEl.value = state.history[state.historyIdx] ?? '';
      liveEl!.textContent = inputEl.value;
    } else if (ev.key === 'ArrowDown' && inputMode === 'command') {
      ev.preventDefault();
      if (state.historyIdx >= state.history.length - 1) {
        state.historyIdx = state.history.length;
        inputEl.value = '';
      } else {
        state.historyIdx++;
        inputEl.value = state.history[state.historyIdx] ?? '';
      }
      liveEl!.textContent = inputEl.value;
    } else if (ev.key === 'l' && ev.ctrlKey) {
      ev.preventDefault();
      out.innerHTML = '';
    }
  });

  root.addEventListener('click', () => {
    inputEl.focus();
  });
  inputEl.focus();
}
