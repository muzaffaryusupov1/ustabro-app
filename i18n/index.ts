import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uz } from "./uz";
import { ru } from "./ru";

export type Locale = "uz" | "ru";

const TRANSLATIONS: Record<Locale, Record<string, string>> = { uz, ru };

const STORAGE_KEY = "ustabro_locale";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  initialize: () => Promise<void>;
}

export const useI18nStore = create<I18nState>((set) => ({
  locale: "uz",

  setLocale: (locale) => {
    set({ locale });
    AsyncStorage.setItem(STORAGE_KEY, locale);
  },

  initialize: async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved === "uz" || saved === "ru") {
      set({ locale: saved });
    }
  },
}));

export function t(key: string, params?: Record<string, string | number>): string {
  const locale = useI18nStore.getState().locale;
  let value = TRANSLATIONS[locale][key];
  if (!value) value = TRANSLATIONS.uz[key]; // fallback to Uzbek
  if (!value) return key;

  if (params) {
    for (const [param, replacement] of Object.entries(params)) {
      value = value.replace(`{${param}}`, String(replacement));
    }
  }

  return value;
}
