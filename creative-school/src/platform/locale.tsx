import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export type Lang = "ru" | "en" | "kk";
export type Localized = readonly [string, string, string];
export const L = (ru: string, en: string, kk: string): Localized => [
  ru,
  en,
  kk,
];
let activeLanguage: Lang = "ru";
export function currentLang() {
  return activeLanguage;
}
const Locale = createContext<Lang>("ru");
export function useLocale() {
  const lang = useContext(Locale);
  return {
    lang,
    t: (s: Localized) => s[lang === "ru" ? 0 : lang === "en" ? 1 : 2],
  };
}
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const l = localStorage.getItem("cs-lang");
      return l === "en" || l === "kk" ? l : "ru";
    } catch {
      return "ru";
    }
  });
  useEffect(() => {
    activeLanguage = lang;
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("cs-lang", lang);
    } catch {
      /* private storage */
    }
  }, [lang]);
  return (
    <Locale.Provider value={lang}>
      {children}
      <div className="language" role="group" aria-label="Language">
        {(["ru", "en", "kk"] as const).map((l) => (
          <button key={l} aria-pressed={l === lang} onClick={() => setLang(l)}>
            {l === "kk" ? "ҚАЗ" : l.toUpperCase()}
          </button>
        ))}
      </div>
    </Locale.Provider>
  );
}
