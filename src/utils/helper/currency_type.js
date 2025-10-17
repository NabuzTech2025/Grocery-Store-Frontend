/**
 * @typedef {Object} Currency
 * @property {string} name
 * @property {string} locale
 * @property {string} symbol
 * @property {string} currency
 * @property {boolean} show
 */

/**
 * @type {{ [key: string]: Currency }}
 */
export const currencyConfig = {
  GERMANY: {
    name: "Germany",
    locale: "de-DE",
    symbol: "€",
    currency: "EUR",
    show: true,
  },
  ENGLISH: {
    name: "English",
    locale: "en-GB",
    symbol: "$",
    currency: "USD",
    show: false,
  },
  SWITZERLAND: {
    name: "Switzerland",
    locale: "de-CH",
    symbol: "CHF",
    currency: "CHF",
    show: false,
  },
};

const selectedCountry = import.meta.env.VITE_COUNTRY || "GERMANY";

/** @type {Currency} */
export const currentCurrency =
  currencyConfig[selectedCountry] || currencyConfig.GERMANY;
