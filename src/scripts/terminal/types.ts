// Shared types for the /play terminal.

export type FileNode =
  | { kind: 'file'; content: string }
  | { kind: 'binary'; bytes: Uint8Array }
  | { kind: 'dir'; entries: Record<string, FileNode> };

export interface Level {
  id: number;
  /** Password that admits the visitor INTO this level (entered at the prior level). */
  password: string;
  /** Filesystem rooted at the visitor's home dir for this level. */
  home: FileNode;
  /** Lines printed when the visitor enters this level. */
  welcome: string[];
}

export interface TerminalState {
  cwd: string[]; // path segments, relative to current level's home
  level: number; // 1..4 active level
  history: string[];
  historyIdx: number; // for ↑/↓ navigation
  completed: boolean;
  vault?: WebAssembly.Instance; // lazily loaded for L4
}

export interface CommandContext {
  state: TerminalState;
  level: Level;
  print: (line: string) => void;
  printRaw: (html: string) => void;
  /** Switch to a new level. Resolves once welcome text has printed. */
  advance: (toLevel: number) => void;
  /** Trigger the final recruitment flag + counter increment. */
  win: () => void;
}

export type CommandFn = (args: string[], ctx: CommandContext) => Promise<void> | void;
