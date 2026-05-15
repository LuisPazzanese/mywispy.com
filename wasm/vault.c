/*
 * Vault check for the /play CTF.
 *
 * Exposes `check(ptr, len)` which returns 1 only if the supplied bytes
 * match a positional XOR transform of an embedded target.
 *
 * The whole point of compiling this to WASM is so the validation isn't
 * sitting in plain JS: a senior solver has to wasm2wat (or read the .wasm
 * bytes directly) to recover the key. That's the "filter for senior" step.
 *
 * Build:
 *   clang --target=wasm32 -O2 -nostdlib -Wl,--no-entry -Wl,--export-all \
 *         wasm/vault.c -o public/vault.wasm
 *
 * Target bytes below were generated from the cleartext "flagship" using
 *   target[i] = "flagship"[i] ^ (0x5A + i)
 * which yields: 3C 37 3D 3A 2D 37 09 11
 *
 * Solving (what a senior would do):
 *   1. Fetch /vault.wasm, run `wasm2wat`
 *   2. Spot the loop: input[i] ^ (0x5A + i) == target[i]
 *   3. Pull target bytes from the data section
 *   4. Reverse: input[i] = target[i] ^ (0x5A + i) → "flagship"
 */

static const unsigned char target[] = {
    0x3C, 0x37, 0x3D, 0x3A, 0x2D, 0x37, 0x09, 0x11
};
static const int target_len = 8;

__attribute__((visibility("default"))) int check(const char* s, int len) {
  if (len != target_len) return 0;
  for (int i = 0; i < target_len; i++) {
    unsigned char x = (unsigned char)s[i] ^ (unsigned char)(0x5A + i);
    if (x != target[i]) return 0;
  }
  return 1;
}
