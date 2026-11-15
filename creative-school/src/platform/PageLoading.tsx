import { L, useLocale } from "./locale";
export function PageLoading() {
  const { t } = useLocale();
  return (
    <div className="cs-loading" role="status" aria-live="polite">
      {t(L("Открываем страницу…", "Opening the page…", "Бет ашылуда…"))}
    </div>
  );
}
