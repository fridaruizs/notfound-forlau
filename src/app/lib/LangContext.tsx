"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, translations, TranslationKey } from "./translations";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "ca",
  setLang: () => {},
  t: (key) => translations.ca[key] as string,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ca");

  useEffect(() => {
    const saved = localStorage.getItem("notfound_lang") as Lang | null;
    if (saved === "es" || saved === "ca") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("notfound_lang", l);
  }

  function t(key: TranslationKey): string {
    return translations[lang][key] as string;
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}