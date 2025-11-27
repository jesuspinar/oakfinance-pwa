
export enum Language {
  EN = 'en',
  NL = 'nl',
  DE = 'de',
  FR = 'fr',
  ES = 'es',
  ZH = 'zh',
}

export interface AppSettings {
  monthStartDay: number; // 1-31, default 1
  currency: string; // e.g., 'USD', 'EUR'
  currencySymbol: string; // e.g., '$', '€'
  language: Language;
}
