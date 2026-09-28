// Rule 3: the sign in the video shows the wallet address on the form, in full and the right way up,
// on paper or on a phone's screen. One character may be wrong; two may not.
import type { Applicant, Sign } from './types';

/** Where a written address and the wallet differ, place by place; a missing character is a difference. */
export function addressErrors(written: string, wallet: string): number[] {
  const a = written.toUpperCase();
  const b = wallet.toUpperCase();
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => i).filter((i) => a[i] !== b[i]);
}

/** Null when the sign shows the address with at most one character wrong. */
export function checkSign(a: Applicant): { sign: Sign | null; wallet: string; wrong: number[] } | null {
  const sign = a.video.sign ?? null;
  const wallet = a.wallet ?? '';
  if (sign === null || sign.kind === 'qr') return { sign, wallet, wrong: [] };
  const wrong = addressErrors(sign.text, wallet);
  return wrong.length > 1 ? { sign, wallet, wrong } : null;
}

/** An address the way a wallet shows it: 0x3F9A…C21E. */
export const shortAddress = (address: string) => (address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address);
