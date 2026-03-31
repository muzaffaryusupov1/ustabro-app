import { useCallback } from "react";
import { t } from "../i18n";

export function useTranslation() {
  const translate = useCallback(
    (key: string, params?: Record<string, string | number>) => t(key, params),
    []
  );

  return { t: translate };
}
