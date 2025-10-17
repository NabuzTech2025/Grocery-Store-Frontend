/**
 * @typedef {Object} MetaTags
 * @property {string} title
 * @property {string} description
 * @property {string} keywords
 * @property {string} language
 */

/** @type {Record<string, MetaTags>} */
const metaTagsByApp = {
  Bombay: {
    title:
      "Bombay Online – Lieferservice und Abholung für Gerichte aus verschiedenen Küchen in 81247 München, Deutschland",
    description:
      "Bestellen Sie leckeres Essen online bei Bombay Online. Genießen Sie eine große Auswahl an Gerichten mit schneller Lieferung und bequemen Abholoptionen in 81247 München, Deutschland.",
    keywords:
      "Online-Lieferung von Speisen in München, Multikulturelle Küche in München, Deutschland, Speisen zum Mitnehmen in München, Deutschland, Bombay Online Restaurant München, Abholservice für Speisen in München, Indische Küche in München, Asiatische Küche in München.",
    language: "de",
  },
  Chotivalaswiss: {
    title:
      "Chotivala Swiss – Lieferservice und Abholung für Gerichte aus verschiedenen Küchen in Centralstrasse 29, 3800 Interlaken",
    description:
      "Bestellen Sie leckeres Essen online bei Chotivala Swiss. Genießen Sie eine große Auswahl an Gerichten mit schneller Lieferung und bequemen Abholoptionen in Centralstrasse 29, 3800 Interlaken.",
    keywords:
      "Lebensmittellieferung in Interlaken, Multikulturelle Küche in Interlaken, Schweiz, Essen zum Mitnehmen in Interlaken, Schweiz, Chotivala Restaurant Interlaken, Abholservice für Lebensmittel in Interlaken, Indische Küche in Interlaken, Asiatische Küche in Interlaken.",
    language: "de",
  },
};

const appName = import.meta.env.VITE_APP_NAME || "Bombay";

/** @type {MetaTags} */
export const currentMeta = metaTagsByApp[appName] || metaTagsByApp.Bombay;
