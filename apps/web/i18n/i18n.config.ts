import { ruPluralRule } from '../app/utils/ru-plural';

export default defineI18nConfig(() => ({
  legacy: false,
  // Russian needs a genuine 4-form plural rule (zero/one/few/many); vue-i18n's
  // built-in rule just clamps `count` to an index and is wrong for Russian.
  // See apps/web/app/utils/ru-plural.ts for why.
  pluralRules: { ru: ruPluralRule },
}));
