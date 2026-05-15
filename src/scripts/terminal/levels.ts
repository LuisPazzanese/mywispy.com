// Level definitions for the /play CTF.
//
// Progression:
//   L1: `ls -a` to find a dotfile → password = "oxide"
//   L2: base64-decode an intercept file → password = "bootloader"
//   L3: XOR every byte with 0x42 (hex dump shown by xxd) → password = "kernel-panic"
//   L4: reverse-engineer public/vault.wasm to find the right input → password = "flagship"
//
// To advance: `play <password>` from the current level enters the next one.

import type { Level } from './types';
import { makeBinary, makeDir, makeFile } from './filesystem';

// --- L3 payload --------------------------------------------------------
// XOR each char of "kernel-panic" with 0x42 to get the obfuscated bytes.
function xorBytes(s: string, key: number): number[] {
  return Array.from(s).map((c) => c.charCodeAt(0) ^ key);
}

export const LEVELS: Level[] = [
  {
    id: 1,
    password: '', // L1 is entered automatically; no password needed.
    home: makeDir({
      'welcome.txt': makeFile(
        [
          'Welcome to wispy/play — a 4-level reverse-engineering CTF.',
          '',
          'Rule of the game: each level hands you the password to the next.',
          'When you find one, type:  play <password>',
          '',
          'Type `help` to see available commands.',
          '',
          'Level 1 hint: what does the visible part of the filesystem hide?',
        ].join('\n'),
      ),
      '.passwd': makeFile('password for level 2: oxide\n'),
    }),
    welcome: [
      '== level 1 ==',
      'objective: find the password to advance.',
      'try: ls, help',
    ],
  },

  {
    id: 2,
    password: 'oxide',
    home: makeDir({
      'notes.txt': makeFile(
        [
          'Intercepted transmission attached as intel.b64.',
          'Format: RFC 4648 (standard).',
          '',
          'The decoded payload contains the password for level 3.',
        ].join('\n'),
      ),
      // base64 of "password for level 3: bootloader\n"
      'intel.b64': makeFile('cGFzc3dvcmQgZm9yIGxldmVsIDM6IGJvb3Rsb2FkZXIK\n'),
    }),
    welcome: [
      '== level 2 ==',
      'objective: decode the intel.',
      'hint: `cat`, `base64`',
    ],
  },

  {
    id: 3,
    password: 'bootloader',
    home: makeDir({
      'notes.txt': makeFile(
        [
          'The payload below was XOR-encrypted with a single-byte key.',
          'The key is 0x42.',
          '',
          'Recover the plaintext to find the password for level 4.',
          'Try: `xxd payload.bin`',
        ].join('\n'),
      ),
      'payload.bin': makeBinary(xorBytes('kernel-panic', 0x42)),
    }),
    welcome: [
      '== level 3 ==',
      'objective: defeat a one-byte XOR cipher.',
      'hint: `xxd`, then math',
    ],
  },

  {
    id: 4,
    password: 'kernel-panic',
    home: makeDir({
      'instructions.txt': makeFile(
        [
          'The vault is sealed with a check compiled into WebAssembly.',
          '',
          'Use:  unlock <password>',
          '',
          'To recover the right password, fetch /vault.wasm and reverse it.',
          'wasm2wat is your friend.',
          '',
          'hints:',
          '  - find the check function in the .wat output; ignore the rest.',
          '  - the data section holds the bytes your input is compared against.',
          '  - the XOR key is NOT constant — it changes per byte position.',
          '',
          'crack this and you ring the final bell.',
        ].join('\n'),
      ),
      // No password file — this level's "password" is the input the WASM accepts.
    }),
    welcome: [
      '== level 4 ==',
      'objective: reverse-engineer /vault.wasm and unlock it.',
      'hint: `cat instructions.txt`, then `unlock <password>`',
    ],
  },
];

/** Look up a level by id (1-based). */
export function getLevel(id: number): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}
