// components/Footer.js
import React from "react";
import { useViewport } from "../../contexts/ViewportContext";
import { Link } from "react-router-dom";
import { currentCurrency } from "../../utils/helper/currency_type";

const Footer = () => {
  const { isMobileViewport } = useViewport();
  const copyrightText =
    import.meta.env.VITE_APP_COPYRIGHT_TEXT || "Default Copyright Text";
  return (
    <footer
      className={`text-center pb-5 ${
        isMobileViewport ? "text-sm" : "text-[16px]"
      }`}
    >
      <span>{copyrightText}</span>&nbsp; &nbsp;
      {currentCurrency.show && (
        <Link
          to="/privacypolicy"
          target="_blank"
          className="text-black font-bold"
        >
          Impressum
        </Link>
      )}
    </footer>
  );
};

export default Footer;
