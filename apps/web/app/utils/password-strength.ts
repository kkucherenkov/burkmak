export type StrengthTone = 'error' | 'warning' | 'info' | 'success';
export interface Strength {
  score: 0 | 1 | 2 | 3 | 4;
  tone: StrengthTone;
}

const TONES: [StrengthTone, StrengthTone, StrengthTone, StrengthTone, StrengthTone] = [
  'error',
  'error',
  'warning',
  'info',
  'success',
];

export function passwordStrength(password: string): Strength {
  if (!password) return { score: 0, tone: 'error' };
  let s = 0;
  if (password.length >= 8) s++;
  if (password.length >= 12) s++;
  if (/[0-9]/.test(password) && /[a-z]/i.test(password)) s++;
  if (/[^a-z0-9]/i.test(password)) s++;
  const score = Math.min(s, 4) as Strength['score'];
  return { score, tone: TONES[score] };
}
