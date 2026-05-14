// CTF writeup data. Empty for now — the section renders a placeholder when this is empty.
// To add a writeup, push an object with the shape below and the section will render it.

export interface Writeup {
  title: string;
  event: string; // CTF/event name
  category: 'web' | 'pwn' | 'crypto' | 'rev' | 'misc' | 'forensics';
  date: string; // ISO YYYY-MM-DD
  href: string; // link to writeup (internal route or external)
  summary: string;
}

export const writeups: Writeup[] = [];
