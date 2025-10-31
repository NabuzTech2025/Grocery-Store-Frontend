// src/components/TitleUpdater.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP_NAME = `${capitalize(
  import.meta.env.VITE_APP_NAME || ""
)} Grocery Store`;

const routeTitles = {
  "/": "",
  "/login": "Login",
  "/register": "Register",
  "/forgot-password": "Forgot Password",
  "/reset-password": "Reset Password",
  "/checkout": "Checkout",
  "/update-address": "Address",
  "/support": "Support",
  "/privacypolicy": "Privacy Policy",
  "/admin": "Admin Login",
  "/admin/home": "Admin Dashboard",
  "/admin/category": "Categories",
  "/admin/category-list": "Category List",
  "/admin/products": "Products",
  "/admin/products-list": "Product List",
  "/admin/tax": "Taxes",
  "/admin/store-setting": "Store Settings",
  "/admin/disscount": "Discounts",
  "/admin/toppings": "Toppings",
  "/admin/topping-groups": "Topping Groups",
  "/admin/group-item": "Group Items",
  "/admin/product-groups": "Product Groups",
};

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const title = routeTitles[path] || "";
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [location]);

  return null;
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default TitleUpdater;
