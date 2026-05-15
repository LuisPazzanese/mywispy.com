// Shell-like commands for the /play terminal.
//
// Each entry is a (name → fn) mapping. Commands receive parsed args plus a
// context that lets them print, advance levels, or trigger the win.

import type { CommandContext, CommandFn, FileNode } from './types';
import { formatPwd, normalisePath, resolvePath, xxd } from './filesystem';
import { getLevel } from './levels';

const HELP_LINES = [
  'available commands:',
  '  ls [-a] [-l]     list directory contents',
  '  cat <file>       print file contents',
  '  cd <dir>         change directory',
  '  pwd              print working directory',
  '  echo <text>      echo text',
  '  grep <pat> <f>   search a file',
  '  find             list every entry from cwd downward',
  '  base64 [-d] <f>  decode (or encode) a file',
  '  xxd <file>       hex+ascii dump of a binary file',
  '  history          show command history',
  '  clear            clear the screen',
  '  help             this message',
  '  play <password>  advance to the next level',
  '  unlock <pw>      [level 4 only] try the vault password',
  '  whoami | id      identify yourself',
];

function getNode(ctx: CommandContext, target: string): FileNode | null {
  const segs = normalisePath(ctx.state.cwd, target);
  return resolvePath(ctx.level.home, segs);
}

function listDir(node: FileNode, showHidden: boolean): string[] {
  if (node.kind !== 'dir') return [];
  const names = Object.keys(node.entries)
    .filter((n) => showHidden || !n.startsWith('.'))
    .sort();
  return names;
}

const ls: CommandFn = (args, ctx) => {
  const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
  const longFmt = args.includes('-l') || args.includes('-la') || args.includes('-al');
  const target = args.find((a) => !a.startsWith('-')) ?? '.';
  const node = getNode(ctx, target);
  if (!node) {
    ctx.print(`ls: cannot access '${target}': No such file or directory`);
    return;
  }
  if (node.kind !== 'dir') {
    ctx.print(target);
    return;
  }
  const names = listDir(node, showAll);
  if (longFmt) {
    for (const name of names) {
      const child = node.entries[name];
      const type = child.kind === 'dir' ? 'd' : '-';
      const size =
        child.kind === 'file'
          ? child.content.length
          : child.kind === 'binary'
            ? child.bytes.length
            : 0;
      ctx.print(`${type}rw-r--r-- 1 visitor visitor ${String(size).padStart(5)} ${name}`);
    }
  } else if (names.length > 0) {
    ctx.print(names.join('  '));
  }
};

const cat: CommandFn = (args, ctx) => {
  if (args.length === 0) {
    ctx.print('usage: cat <file>');
    return;
  }
  for (const target of args) {
    const node = getNode(ctx, target);
    if (!node) {
      ctx.print(`cat: ${target}: No such file or directory`);
      continue;
    }
    if (node.kind === 'dir') {
      ctx.print(`cat: ${target}: Is a directory`);
      continue;
    }
    if (node.kind === 'binary') {
      // Show what `cat` actually prints for binaries: an ugly mess.
      let s = '';
      for (const b of node.bytes) {
        s += b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '?';
      }
      ctx.print(s);
      ctx.print('(tip: try `xxd ' + target + '`)');
      continue;
    }
    for (const line of node.content.split('\n')) ctx.print(line);
  }
};

const cd: CommandFn = (args, ctx) => {
  const target = args[0] ?? '~';
  const segs = normalisePath(ctx.state.cwd, target);
  const node = resolvePath(ctx.level.home, segs);
  if (!node) {
    ctx.print(`cd: ${target}: No such file or directory`);
    return;
  }
  if (node.kind !== 'dir') {
    ctx.print(`cd: ${target}: Not a directory`);
    return;
  }
  ctx.state.cwd = segs;
};

const pwd: CommandFn = (_, ctx) => {
  ctx.print(formatPwd(ctx.state.cwd));
};

const echo: CommandFn = (args, ctx) => {
  ctx.print(args.join(' '));
};

const help: CommandFn = (_, ctx) => {
  for (const line of HELP_LINES) ctx.print(line);
};

const clear: CommandFn = (_, ctx) => {
  // Signal the terminal driver to wipe the output. We use a sentinel string;
  // the driver intercepts it before rendering.
  ctx.print('\x00CLEAR\x00');
};

const history: CommandFn = (_, ctx) => {
  ctx.state.history.forEach((cmd, i) => ctx.print(`${String(i + 1).padStart(4)}  ${cmd}`));
};

const whoami: CommandFn = (_, ctx) => {
  ctx.print('visitor');
};

const base64cmd: CommandFn = (args, ctx) => {
  const decode = args.includes('-d') || args.includes('--decode');
  const target = args.find((a) => !a.startsWith('-'));
  if (!target) {
    ctx.print('usage: base64 [-d] <file>');
    return;
  }
  const node = getNode(ctx, target);
  if (!node || node.kind === 'dir') {
    ctx.print(`base64: ${target}: No such file`);
    return;
  }
  const text = node.kind === 'file' ? node.content : '';
  if (decode) {
    try {
      const decoded = atob(text.trim().replace(/\s+/g, ''));
      for (const line of decoded.split('\n')) ctx.print(line);
    } catch {
      ctx.print('base64: invalid input');
    }
  } else {
    ctx.print(btoa(text));
  }
};

const xxdCmd: CommandFn = (args, ctx) => {
  const target = args[0];
  if (!target) {
    ctx.print('usage: xxd <file>');
    return;
  }
  const node = getNode(ctx, target);
  if (!node || node.kind === 'dir') {
    ctx.print(`xxd: ${target}: No such file`);
    return;
  }
  const bytes =
    node.kind === 'binary'
      ? node.bytes
      : new TextEncoder().encode(node.content);
  for (const line of xxd(bytes)) ctx.print(line);
};

const grep: CommandFn = (args, ctx) => {
  if (args.length < 2) {
    ctx.print('usage: grep <pattern> <file>');
    return;
  }
  const [pat, target] = args;
  const node = getNode(ctx, target);
  if (!node || node.kind !== 'file') {
    ctx.print(`grep: ${target}: No such text file`);
    return;
  }
  for (const line of node.content.split('\n')) {
    if (line.includes(pat)) ctx.print(line);
  }
};

const find: CommandFn = (_, ctx) => {
  const walk = (node: FileNode, path: string) => {
    ctx.print(path || '.');
    if (node.kind === 'dir') {
      for (const [name, child] of Object.entries(node.entries)) {
        walk(child, path ? `${path}/${name}` : `./${name}`);
      }
    }
  };
  walk(ctx.level.home, '');
};

const play: CommandFn = (args, ctx) => {
  const pw = args[0];
  if (!pw) {
    ctx.print('usage: play <password>');
    return;
  }
  const next = getLevel(ctx.state.level + 1);
  if (!next) {
    ctx.print('no further levels — try `unlock` to finish.');
    return;
  }
  if (pw !== next.password) {
    ctx.print('access denied.');
    return;
  }
  ctx.advance(next.id);
};

const unlock: CommandFn = async (args, ctx) => {
  if (ctx.state.level !== 4) {
    ctx.print('unlock: only the level 4 vault accepts this.');
    return;
  }
  const pw = args[0];
  if (!pw) {
    ctx.print('usage: unlock <password>');
    return;
  }
  if (!ctx.state.vault) {
    ctx.print('loading vault…');
    try {
      const res = await fetch('/vault.wasm');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { instance } = await WebAssembly.instantiateStreaming(res, {});
      ctx.state.vault = instance;
    } catch (err) {
      ctx.print('vault: failed to load wasm — ' + (err as Error).message);
      return;
    }
  }
  const inst = ctx.state.vault;
  const exports = inst.exports as {
    memory: WebAssembly.Memory;
    check: (ptr: number, len: number) => number;
  };
  const bytes = new TextEncoder().encode(pw);
  const mem = new Uint8Array(exports.memory.buffer);
  const ptr = 1024; // arbitrary writable scratch address inside the module
  for (let i = 0; i < bytes.length; i++) mem[ptr + i] = bytes[i];
  const ok = exports.check(ptr, bytes.length);
  if (ok === 1) {
    ctx.print('vault: unlocked.');
    ctx.win();
  } else {
    ctx.print('vault: denied.');
  }
};

export const COMMANDS: Record<string, CommandFn> = {
  ls,
  cat,
  cd,
  pwd,
  echo,
  help,
  clear,
  history,
  whoami,
  id: whoami,
  base64: base64cmd,
  xxd: xxdCmd,
  grep,
  find,
  play,
  unlock,
};
