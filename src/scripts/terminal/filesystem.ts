// Filesystem helpers for the /play terminal.

import type { FileNode } from './types';

export function makeFile(content: string): FileNode {
  return { kind: 'file', content };
}

export function makeBinary(bytes: number[] | Uint8Array): FileNode {
  return { kind: 'binary', bytes: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes) };
}

export function makeDir(entries: Record<string, FileNode>): FileNode {
  return { kind: 'dir', entries };
}

/** Walk from `root` along `path` segments. Returns null if anything's missing. */
export function resolvePath(root: FileNode, path: string[]): FileNode | null {
  let node: FileNode = root;
  for (const seg of path) {
    if (node.kind !== 'dir') return null;
    const next = node.entries[seg];
    if (!next) return null;
    node = next;
  }
  return node;
}

/** Normalise a path string (relative or absolute) against `cwd`, returns segments. */
export function normalisePath(cwd: string[], target: string): string[] {
  let segs: string[];
  if (target.startsWith('/') || target === '~' || target.startsWith('~/')) {
    segs = [];
    if (target.startsWith('~')) target = target.slice(1);
    target = target.replace(/^\//, '');
  } else {
    segs = [...cwd];
  }
  if (target) {
    for (const part of target.split('/')) {
      if (part === '' || part === '.') continue;
      if (part === '..') {
        segs.pop();
      } else {
        segs.push(part);
      }
    }
  }
  return segs;
}

export function formatPwd(cwd: string[]): string {
  return cwd.length === 0 ? '~' : '~/' + cwd.join('/');
}

/** Hex-dump bytes in xxd-compatible format. */
export function xxd(bytes: Uint8Array): string[] {
  const lines: string[] = [];
  for (let off = 0; off < bytes.length; off += 16) {
    const chunk = bytes.subarray(off, off + 16);
    const hex: string[] = [];
    for (let i = 0; i < 16; i++) {
      if (i < chunk.length) hex.push(chunk[i].toString(16).padStart(2, '0'));
      else hex.push('  ');
      if (i === 7) hex.push('');
    }
    const ascii = Array.from(chunk)
      .map((b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.'))
      .join('');
    lines.push(`${off.toString(16).padStart(8, '0')}: ${hex.join(' ')}  ${ascii}`);
  }
  return lines;
}
