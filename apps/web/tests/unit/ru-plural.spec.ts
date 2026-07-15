import { describe, expect, it } from 'vitest';

import { ruPluralRule } from '~/utils/ru-plural';

// Four choices: 0 = zero, 1 = one, 2 = few, 3 = many — matches
// `shelves.itemCount` in ru.ts ('Нет элементов | {count} элемент | {count} элемента | {count} элементов').
const pick = (count: number): number => ruPluralRule(count, 4, undefined);

describe('ruPluralRule', () => {
  it('picks the zero form for 0', () => {
    expect(pick(0)).toBe(0);
  });

  it('picks the "one" form for numbers ending in 1 (excluding 11)', () => {
    expect(pick(1)).toBe(1);
    expect(pick(21)).toBe(1);
    expect(pick(101)).toBe(1);
  });

  it('picks the "few" form for numbers ending in 2-4 (excluding 12-14)', () => {
    expect(pick(2)).toBe(2);
    expect(pick(3)).toBe(2);
    expect(pick(4)).toBe(2);
    expect(pick(22)).toBe(2);
    expect(pick(24)).toBe(2);
  });

  it('picks the "many" form for numbers ending in 5-20 and 0', () => {
    expect(pick(5)).toBe(3);
    expect(pick(20)).toBe(3);
    expect(pick(25)).toBe(3);
  });

  // The regression this whole rule exists for: a naive `Math.min(count, 2)`
  // (vue-i18n's default) would put 11-14 in the "few" bucket alongside 2-4.
  // Russian teens are irregular — they always take the "many" form regardless
  // of their last digit.
  it('treats the teens (11-14) as "many", not "one" or "few"', () => {
    expect(pick(11)).toBe(3);
    expect(pick(12)).toBe(3);
    expect(pick(13)).toBe(3);
    expect(pick(14)).toBe(3);
  });

  it('falls back to a 3-choice scale when choicesLength < 4', () => {
    expect(ruPluralRule(2, 3, undefined)).toBe(2);
    expect(ruPluralRule(5, 3, undefined)).toBe(2);
  });
});
