import React from "react";
import { useViewport } from "../../../contexts/ViewportContext";
import { Link } from "react-router-dom";
import { currentCurrency } from "../../../utils/helper/currency_type";

const Footer = () => {
  const { isMobileViewport } = useViewport();
  const copyrightText =
    import.meta.env.VITE_APP_COPYRIGHT_TEXT || "Default Copyright Text";

  return (
    <footer
      className={`text-center py-4 ${
        isMobileViewport ? "text-sm" : "text-[16px]"
      }`}
      style={{
        backgroundColor: "#f8f9fa",
        borderTop: "1px solid #e9ecef"
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <p className="mb-2">
              <span>{copyrightText}</span>
              {currentCurrency.show && (
                <>
                  <span className="mx-2">|</span>
                  <Link
                    to="/privacypolicy"
                    target="_blank"
                    className="text-black font-bold text-decoration-none"
                  >
                    Impressum
                  </Link>
                </>
              )}
            </p>
            <div className="footer-links">
              <Link 
                to="/support" 
                className="text-decoration-none me-3"
                style={{ color: "#6c757d" }}
              >
                Support
              </Link>
              <Link 
                to="/privacypolicy" 
                className="text-decoration-none me-3"
                style={{ color: "#6c757d" }}
              >
                Privacy Policy
              </Link>
              <Link 
                to="/login" 
                className="text-decoration-none"
                style={{ color: "#6c757d" }}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
