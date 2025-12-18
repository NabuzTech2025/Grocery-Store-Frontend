import { currentCurrency } from "./currency_type";

const lang_Type = {
  en: "English",
  de: "German",
};

/**
 * @typedef {typeof translations['en']} TranslationKeys
 */

const translations = {
  // English
  en: {
    login: "Login",
    guest_login: "Guest Login",

    register: "Register",
    login_or_register: "Login or Register",
    logout: "Logout",
    search_anything: "Search Anything",
    green_login: "Green Login",
    your_email: "Your Email",
    your_name: "Your Name",
    your_phone: "Your Phone Number",
    password: "Password",
    customer_name: "Customer Name",
    forgotPassword: "Forgot Password?",
    submit: "Submit",
    dont_have_account: "Don't have an account yet?",
    register_here: "Register Here",
    already_have_account: "Already have an account?",
    login_here: "Login here",
    click_here: "Click Here",
    postCode: "Postcode",
    change_postcode: "Change Postcode",
    off_delivery: "OFF Delivery",
    delivery: "Delivery",
    off_pickup: "OFF Pickup",
    pickup: "Pickup",
    cash: "Cash",
    cash_on_delivery: "Cash on Delivery",
    online_payment: "Online Payment",
    select_your_address: "Select your Address",
    address: "Address",
    delivery_fee: "Delivery Fee",
    items: "Items",
    item: "Item",
    qty: "Qty",
    price: "Price",
    edit: "Edit",
    your_cart_is_empty: "Your cart is empty",
    total: "Total",
    subtotal: "Subtotal",
    discount: "Discount",
    save: "Save",
    saved: "Saved",
    save_changes: "Save Changes",
    delivery_charges: "Delivery Charges",
    grand_total: "Grand Total",
    change_postcode: "Change Postcode",
    items_added: "items added",
    add: "Add",
    added: "Added",
    update: "Update",
    add_note: "Add Note",
    edit_note: "Edit Note",
    discount_management: "Discount Management",
    set_discount_percentages: "Set Discount Percentages",
    delivery_discount_percentage: "Delivery Discount Percentage (%)",
    pickup_discount_percentage: "Pickup Discount Percentage (%)",
    expiry_date: "Expiry Date",
    saving: "Saving...",
    processing: "Processing",
    updating: "Updating",
    continue: "Continue",
    sending: "Sending",
    message: "Message",
    save_discounts: "Save Discounts",
    current_discounts: "Current Discounts",
    loading_discounts: "Loading discounts...",
    type: "Type",
    value: "Value",
    loading: "Loading",
    view_cart: "View Cart",
    order_processing: "Your order",
    is_being_processed: "is being processed...",
    order_accepted: "Your Order has been Accepted",
    thanks_order: "Thanks for your order!",
    order_id: "Order ID",
    order_Number: "Your Order Number",
    back_to: "Back to",
    home: "Home",
    order_not_accepted: "Order Not Accepted",
    order_rejected_message: "Sorry, the restaurant couldn't accept your order",
    waiting_confirmation: "Waiting for Restaurant Confirmation",
    no_categories_available: "No categories available",
    select_payment_method: "Select Payment Method",
    no_products_found: "No products found in any category",
    update_your_info: "Update Your Info",
    enter_your_details: "Enter Your Details",
    enter_shipping_address: "Enter Your Shipping Address",
    edit_address_details: "Edit Address Details",
    apartment: "Apartment / House number",
    city: "City",
    country: "Country",
    contact_thank_you_heading: "Thank you for contacting us!",
    contact_thank_you_message:
      "Your message has been successfully sent. We will get back to you soon.",
    contact_us_heading: "Contact Us",
    contact_us_message:
      "Have questions? Fill out the form below and we'll get back to you as soon as possible.",
    reset_password_heading: "Reset Password",
    new_password_label: "New Password",
    confirm_password_label: "Confirm Password",
    pay_now: "Pay Now",
    place_Order: "Place Order",
    closed_for_today: "Closed for today",
    opens_at: "Opens at",
    cancel: "Cancel",
    note: "Note",
    form_fill_message: "Please fill out all the fields",
    payment_completed_message: "Payment completed successfully!",
    transaction_id: "Transaction ID",
    online_payment_instructions:
      "Click the PayPal button above to complete your payment. Your order will be placed automatically after successful payment.",
    cash_payment_instructions: "You will pay in cash upon delivery/pickup.",
    paypal_insufficient_funds:
      "You don't have enough balance in your PayPal account to complete this payment.",
    paypal_capture_status: "Payment capture status:",
    paypal_not_completed: "Payment was not completed successfully.",
    paypal_failed: "Payment failed. Please try again.",
    paypal_error: "An error occurred during payment. Please try again.",
    paypal_cancelled: "Payment was cancelled.",
    paypal_complete_first: "Please complete the PayPal payment first.",
    paypal_declined: "Your payment method was declined. Please try another.",
    paypal_card_expired:
      "Your card has expired. Please use a different payment method.",
    paypal_pending: "Your payment is pending. Please wait for confirmation.",
    currency_symbol: "$",
    currency_code: "USD",
    immediately: "Immediately",
    today: "Today",
    preorder: "Preorder",
    pre_order: "Pre-order",
    available_times: "Available Times",
    select_valid_time: "Please select a valid time.",
    time: "Time",
    no_available_time_slots: "No available time slots",
    confirm_location: "Confirm Location",
    Servicefee: "Service Fee",
  },
  // German
  de: {
    login: "Anmeldung",
    guest_login: "Gast-Login",

    register: "Registrieren",
    login_or_register: "Anmelden oder Registrieren",
    logout: "Ausloggen",
    search_anything: "Alles Suchen",
    green_login: "Einloggen",
    your_email: "Ihre E-Mail",
    your_name: "Ihre Name",
    your_phone: "Ihre Telefonnummer",
    password: "Kennwort",
    customer_name: "Name",
    forgotPassword: "Passwort vergessen?",
    submit: "Einreichen",
    dont_have_account: "Sie haben noch kein Konto?",
    register_here: "Hier registrieren",
    already_have_account: "Hast du bereits ein Konto?",
    login_here: "Hier anmelden",
    click_here: "Hier klicken",
    postCode: "Wählen Sie Ihre Region",
    change_postcode: "Postleitzahl ändern",
    off_delivery: "OFF-Lieferung",
    delivery: "Lieferung",
    off_pickup: "OFF-Abholung",
    pickup: "Abholung",
    cash: "Bar",
    cash_on_delivery: "Bargeld",
    online_payment: "Online",
    select_your_address: "Ihre Postleitzahl",
    address: "Adresse",
    delivery_fee: "Liefergebühr",
    items: "Artikel",
    item: "Artikel",
    qty: "Menge",
    price: "Preis",
    edit: "Bearb",
    add_note: "Notiz hinzufügen",
    edit_note: "Bearbeitungshinweis",
    update: "Aktualisieren",
    your_cart_is_empty: "Ihr Warenkorb ist leer",
    total: "Gesamt",
    subtotal: "Zwischensumme",
    discount: "Rabatt",
    save: "Speichern",
    saved: "Gespart",
    save_changes: "Änderungen speichern",
    delivery_charges: "Liefergebühren",
    grand_total: "Gesamtsumme",
    change_postcode: "Postleitzahl ändern",
    place_order: "Weiter",
    items_added: "Artikel hinzugefügt",
    add: "Hinzufügen",
    added: "hinzugefügt",
    discount_management: "Rabattverwaltung",
    set_discount_percentages: "Rabattprozentsätze festlegen",
    delivery_discount_percentage: "Lieferungsrabatt (%)",
    pickup_discount_percentage: "Abholungsrabatt (%)",
    expiry_date: "Ablaufdatum",
    saving: "Speichert...",
    processing: "Verarbeitung",
    updating: "Aktualisierung",
    continue: "Weiter",
    sending: "Senden",
    message: "Nachricht",
    save_discounts: "Rabatte speichern",
    current_discounts: "Aktuelle Rabatte",
    loading_discounts: "Lade Rabatte...",
    type: "Typ",
    value: "Wert",
    loading: "Lade",
    view_cart: "weiter",
    order_processing: "Ihre Bestellung",
    is_being_processed: "wird bearbeitet...",
    order_accepted: "Ihre Bestellung wurde angenommen",
    thanks_order: "Danke für Ihre Bestellung!",
    order_id: "Bestellnummer",
    order_Number: "Ihre Bestellnummer",
    back_to: "Zurück zu",
    home: "Startseite",
    order_not_accepted: "Bestellung nicht angenommen",
    order_rejected_message:
      "Leider konnte das Restaurant Ihre Bestellung nicht annehmen",
    waiting_confirmation: "Warten auf Bestätigung durch das Restaurant",
    no_categories_available: "Keine Kategorien verfügbar",
    select_payment_method: "Zahlungsmethode auswählen",
    online_payment: "Online-Zahlung",
    no_products_found: "Keine Produkte in irgendeiner Kategorie gefunden",
    update_your_info: "Aktualisieren Sie Ihre Daten",
    enter_your_details: "Geben Sie Ihre Daten ein",
    enter_shipping_address: "Geben Sie Ihre Lieferadresse ein",
    edit_address_details: "Adressdetails bearbeiten",
    apartment: "Straße und Hausnummer",
    city: "Ort",
    country: "Land",
    contact_thank_you_heading: "Vielen Dank für Ihre Kontaktaufnahme!",
    contact_thank_you_message:
      "Ihre Nachricht wurde erfolgreich gesendet. Wir werden uns bald bei Ihnen melden.",
    contact_us_heading: "Kontaktieren Sie uns",
    contact_us_message:
      "Haben Sie Fragen? Füllen Sie das untenstehende Formular aus, und wir werden uns so schnell wie möglich bei Ihnen melden.",
    reset_password_heading: "Passwort zurücksetzen",
    new_password_label: "Neues Passwort",
    confirm_password_label: "Passwort bestätigen",
    pay_now: "Jetzt bezahlen",
    closed_for_today: "Heute geschlossen",
    opens_at: "Eröffnet am",
    cancel: "Abbrechen",
    note: "Notiz",
    form_fill_message: "Bitte füllen Sie alle Felder aus",
    payment_completed_message: "Zahlung erfolgreich abgeschlossen!",
    transaction_id: "Transaktions-ID",
    online_payment_instructions:
      "Klicken Sie oben auf den PayPal-Button, um Ihre Zahlung abzuschließen. Ihre Bestellung wird nach erfolgreicher Zahlung automatisch abgeschickt.",
    cash_payment_instructions:
      "Die Bezahlung erfolgt in bar bei Lieferung/Abholung.",
    paypal_insufficient_funds:
      "Ihr PayPal-Konto verfügt nicht über ausreichende Mittel.",
    paypal_capture_status: "Zahlungserfassungsstatus:",
    paypal_not_completed: "Die Zahlung wurde nicht erfolgreich abgeschlossen.",
    paypal_failed: "Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    paypal_error:
      "Während der Zahlung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    paypal_cancelled: "Die Zahlung wurde abgebrochen.",
    paypal_complete_first: "Bitte schließen Sie zuerst die PayPal-Zahlung ab.",
    paypal_declined:
      "Ihre Zahlungsmethode wurde abgelehnt. Bitte versuchen Sie es mit einer anderen.",
    paypal_card_expired:
      "Ihre Karte ist abgelaufen. Bitte verwenden Sie eine andere Zahlungsmethode.",
    paypal_pending:
      "Ihre Zahlung ist ausstehend. Bitte warten Sie auf die Bestätigung.",
    currency_symbol: "€",
    currency_code: "EUR",
    immediately: "Sofort",
    today: "Heute",
    preorder: "Vorbestellen",
    pre_order: "Vorbestellung",
    available_times: "Verfügbare Zeiten",
    select_valid_time: "Bitte wählen Sie eine gültige Uhrzeit aus.",
    time: "Zeit",
    no_available_time_slots: "Keine verfügbaren Zeitslots",
    confirm_location: "Standort bestätigen",
    Servicefee: "Servicegebühr",
  },
};

// Exchange rates cache
let exchangeRatesCache = {
  rates: null,
  lastUpdated: null,
  cacheExpiry: 60 * 60 * 1000, // 1 hour
};

// Function to get translations based on language code
/**
 * @param {keyof typeof translations | null} langCode
 * @returns {TranslationKeys}
 */
export const getTranslations = (langCode = null) => {
  const currentLang = langCode || getCurrentLanguage();
  return translations[currentLang] || translations["de"];
};

// Function to get current language from localStorage or default
export const getCurrentLanguage = () => {
  return localStorage.getItem("app_language") || "de";
};

// Fetch exchange rates from API
const fetchExchangeRates = async () => {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    const data = await response.json();

    exchangeRatesCache.rates = data.rates;
    exchangeRatesCache.lastUpdated = Date.now();

    // Cache in localStorage
    localStorage.setItem(
      "exchange_rates_cache",
      JSON.stringify(exchangeRatesCache)
    );

    return data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);

    // Try to get from localStorage cache
    const cached = localStorage.getItem("exchange_rates_cache");
    if (cached) {
      const parsedCache = JSON.parse(cached);
      exchangeRatesCache = parsedCache;
      return parsedCache.rates;
    }

    // Fallback rates
    return {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.73,
    };
  }
};

// Get exchange rates (with caching)
const getExchangeRates = async () => {
  // Check if we have valid cached rates
  if (
    exchangeRatesCache.rates &&
    exchangeRatesCache.lastUpdated &&
    Date.now() - exchangeRatesCache.lastUpdated < exchangeRatesCache.cacheExpiry
  ) {
    return exchangeRatesCache.rates;
  }

  // Try to load from localStorage
  const cached = localStorage.getItem("exchange_rates_cache");
  if (cached) {
    const parsedCache = JSON.parse(cached);
    if (
      parsedCache.rates &&
      parsedCache.lastUpdated &&
      Date.now() - parsedCache.lastUpdated < exchangeRatesCache.cacheExpiry
    ) {
      exchangeRatesCache = parsedCache;
      return parsedCache.rates;
    }
  }

  // Fetch new rates
  return await fetchExchangeRates();
};

// Convert currency function
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) return amount;

    const rates = await getExchangeRates();
    if (!rates) return amount;

    let convertedAmount = amount;

    // Convert to USD first if not already
    if (fromCurrency !== "USD") {
      convertedAmount = amount / rates[fromCurrency];
    }

    // Convert from USD to target currency
    if (toCurrency !== "USD") {
      convertedAmount = convertedAmount * rates[toCurrency];
    }

    return convertedAmount;
  } catch (error) {
    console.error("Currency conversion error:", error);
    return amount; // Return original amount on error
  }
};

// Format currency with conversion
export const formatCurrency = async (
  amount,
  langCode = null,
  baseCurrency = "USD"
) => {
  try {
    const currentLang = langCode || getCurrentLanguage();
    const lang = getTranslations(currentLang);

    let finalAmount = amount;

    // Convert currency if needed
    if (baseCurrency !== lang.currency_code) {
      finalAmount = await convertCurrency(
        amount,
        baseCurrency,
        lang.currency_code
      );
    }

    // Format based on language
    if (currentLang === "en") {
      return `${lang.currency_symbol}${parseFloat(finalAmount).toFixed(2)}`;
    } else {
      // German format: €12,50
      return `${parseFloat(finalAmount).toFixed(2).replace(".", ",")} ${
        lang.currency_symbol
      }`;
    }
  } catch (error) {
    console.error("Currency formatting error:", error);
    // Fallback formatting
    const lang = getTranslations(langCode);
    return `${lang.currency_symbol}${parseFloat(amount).toFixed(2)}`;
  }
};

export const formatCurrencySync = (amount, langCode = null) => {
  return `${currentCurrency.symbol}${parseFloat(amount)
    .toFixed(2)
    .replace(".", ",")}`;
};

// Export current language for backward compatibility
/** @type {TranslationKeys} */
export const currentLanguage = getTranslations(getCurrentLanguage());

export default translations;
