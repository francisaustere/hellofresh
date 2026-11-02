import { createI18n } from "vue-i18n";
import fr from "@/locales/fr.json";

// French pluralisation: 0 and 1 are singular.
function frenchPlural(choice: number, choicesLength: number): number {
  if (choicesLength === 2) return choice > 1 ? 1 : 0;
  return Math.min(choice, choicesLength - 1);
}

export const i18n = createI18n({
  legacy: false,
  locale: "fr",
  fallbackLocale: "fr",
  messages: { fr },
  pluralRules: { fr: frenchPlural },
});
