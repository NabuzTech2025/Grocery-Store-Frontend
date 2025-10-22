const basePath = import.meta.env.VITE_APP_BASE_ROUTE;
const registerLink = basePath !== "" ? `/${basePath}/register` : `/register`;
const forgotPasswordLink =
  basePath !== "" ? `/${basePath}/forgot-password` : `/forgot-password`;
const loginLink = basePath !== "" ? `/${basePath}/login` : `/login`;
const homeLink = basePath !== "" ? `/${basePath}/` : `/`;
const payload_url =
  basePath !== ""
    ? import.meta.env.VITE_APP_BASE_URL + `${basePath}/`
    : import.meta.env.VITE_APP_BASE_URL;
const resetPassword_url = basePath !== "" ? payload_url : payload_url + "/";

// for PayPal
const APP_MODE = import.meta.env.VITE_APP_MODE || "DEVELOPMENT";

const PAYPAL_CLIENT_ID =
  APP_MODE === "PRODUCTION"
    ? import.meta.env.VITE_PAYMENT_LIVE_CLIENT_ID || "sb"
    : import.meta.env.VITE_PAYMENT_SANDBOX_CLIENT_ID || "sb";

export {
  basePath,
  registerLink,
  payload_url,
  forgotPasswordLink,
  resetPassword_url,
  PAYPAL_CLIENT_ID,
  APP_MODE,
  loginLink,
  homeLink,
};
