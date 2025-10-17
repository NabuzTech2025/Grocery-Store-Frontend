// contexts/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentLanguage,
  getTranslations,
} from "../utils/helper/lang_translate";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getCurrentLanguage());
  const [translations, setTranslations] = useState(getTranslations(language));

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("app_language", newLanguage);
    setTranslations(getTranslations(newLanguage));
  };

  useEffect(() => {
    // Update translations when language changes
    setTranslations(getTranslations(language));
  }, [language]);

  const value = {
    language,
    translations,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
