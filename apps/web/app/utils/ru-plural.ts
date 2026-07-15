import type { PluralizationRule } from 'vue-i18n';

/**
 * vue-i18n's built-in pluralisation (`Math.min(choice, 2)` once there are 3+
 * `|`-separated forms) only distinguishes zero / one-bucket / everything-else
 * — it treats `count` as a literal index. That is correct for English but
 * wrong for Russian, which needs a genuine choice among four grammatical
 * forms (zero / one / few / many): e.g. 21 reads as "one" (nominative
 * singular), 2-4 reads as "few" (genitive singular), 5-20 and 0 read as
 * "many" (genitive plural) — none of that is `Math.min(count, 2)`.
 *
 * This mirrors vue-i18n's own documented custom-pluralisation example for
 * Russian: https://vue-i18n.intlify.dev/guide/essentials/pluralization.html#custom-pluralization
 */
export const ruPluralRule: PluralizationRule = (choice, choicesLength) => {
  if (choice === 0) return 0;
  const teen = choice > 10 && choice < 20;
  const endsWithOne = choice % 10 === 1;
  if (!teen && endsWithOne) return 1;
  if (!teen && choice % 10 >= 2 && choice % 10 <= 4) return 2;
  return choicesLength < 4 ? 2 : 3;
};
