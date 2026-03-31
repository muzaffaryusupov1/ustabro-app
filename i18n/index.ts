import { uz } from "./uz";

const strings: Record<string, string> = uz;

export function t(key: string, params?: Record<string, string | number>): string {
  let value = strings[key];
  if (!value) return key;

  if (params) {
    for (const [param, replacement] of Object.entries(params)) {
      value = value.replace(`{${param}}`, String(replacement));
    }
  }

  return value;
}
