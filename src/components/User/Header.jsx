import React, { useState, useEffect } from "react";
import AddressModal from "../User/modals/AddressModal";
import LoginModal from "@/components/User/modals/LoginModal";
import { useAuth } from "@/auth/AuthProvider";
import { useCart } from "../../contexts/CartContext";
import { useViewport } from "../../contexts/ViewportContext";
import { payload_url } from "../../utils/common_urls";
import brandLogo from "../../../public/assets/user/img/brand-logo.png";
import userLogo from "../../../public/assets/user/img/login-icon.svg";
import german_flag from "../../../public/assets/user/img/german-flag.jpg";
import english_flag from "../../../public/assets/user/img/english-flag.jpg";
import { useStoreStatus } from "../../contexts/StoreStatusContext";
import "./../../../ui/css/Header.css";
import { useLanguage } from "../../contexts/LanguageContext";

const Header = ({ status, onSearch }) => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedPostcode, setSelectedPostcode] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const { isSmallestViewport } = useViewport();
  const { isAuthenticated, logout, user } = useAuth();
  const { clearCart } = useCart();
  const { isMobileViewport } = useViewport();
  const { postCode, setPostCode, orderType: order_type } = useStoreStatus();
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  const logoutUser = () => {
    logout();
    window.location.replace(payload_url);
  };

  useEffect(() => {
    if (postCode) {
      setSelectedPostcode(postCode);
    } else {
      const storedPostcode = localStorage.getItem("delivery_postcode");
      if (storedPostcode) {
        setSelectedPostcode(storedPostcode);
        setPostCode(storedPostcode);
      }
    }
  }, [postCode, setPostCode]);

  // Updated language change handler - no window reload needed
  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setShowLangDropdown(false);
  };

  const handlePostcodeSelect = (data) => {
    setSelectedPostcode(data.postcode);
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee);
    setPostCode(data.postcode);
  };

  const onChangeSearch = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    onSearch(val);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLangDropdown) {
        setShowLangDropdown(false);
      }
      if (showAccountMenu) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showLangDropdown, showAccountMenu]);

  return (
    <>
      <header id="header">
        <div className="container">
          <div className="row">
            {/* Left Side */}
            <div className="col-lg-10 col-sm-10 col-6">
              <div className="header-left-area">
                <div
                  className={`brand-logo-container ${
                    isMobileViewport ? "mobile" : ""
                  }`}
                >
                  <a
                    href={payload_url}
                    onClick={(e) => {
                      if (localStorage.getItem("order_placed") === "true") {
                        clearCart();
                        localStorage.removeItem("order_placed");
                      }
                    }}
                  >
                    <img
                      src={brandLogo}
                      alt="Brand Logo"
                      className={isMobileViewport ? "mobile" : ""}
                    />
                  </a>
                </div>

                {status && (
                  <>
                    {/* Desktop */}
                    <div className="header-middle-area d-none d-sm-flex">
                      {order_type === "delivery" && (
                        <div
                          className="header-postcode-col"
                          onClick={() => setShowAddressModal(true)}
                        >
                          <div className="postcode-icon">
                            <img
                              src={`assets/user/img/location-icon.svg`}
                              alt="Location"
                            />
                          </div>
                          <div className="header-postcode-cnt">
                            <h3>
                              {selectedPostcode === "" || !selectedPostcode
                                ? currentLanguage.postCode
                                : selectedPostcode}
                            </h3>
                            <i className="bi bi-chevron-down"></i>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="d-sm-none mt-2">
                      {order_type === "delivery" && (
                        <div
                          className="header-postcode-col"
                          onClick={() => setShowAddressModal(true)}
                        >
                          <img
                            src={`assets/user/img/location-icon.svg`}
                            alt="Location"
                            className="location-icon-mobile"
                          />
                          <h3
                            className={`mobile ${
                              isSmallestViewport ? "smallest" : "small"
                            }`}
                          >
                            {selectedPostcode === "" || !selectedPostcode
                              ? currentLanguage.postCode
                              : selectedPostcode.slice(0, 14) + "..."}
                          </h3>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="col-lg-2 col-sm-2 col-6">
              <div className="header-login">
                {/* Account/Login */}
                <div className="account-container">
                  {isAuthenticated ? (
                    <div
                      className="account-menu-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAccountMenu((v) => !v);
                      }}
                    >
                      <img src={userLogo} alt="Account" />
                      <span className="account-text">
                        {isMobileViewport
                          ? user?.customer_name?.split(" ")[0]?.length > 4
                            ? `${user.customer_name
                                .split(" ")[0]
                                .slice(0, 4)}...`
                            : user?.customer_name?.split(" ")[0]
                          : user?.customer_name?.split(" ")[0]}
                      </span>
                    </div>
                  ) : (
                    <a
                      href="#"
                      className="account-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowLoginModal(true);
                      }}
                    >
                      <img src={userLogo} alt="Login" />
                      <span className="account-text">
                        {currentLanguage.login}
                      </span>
                    </a>
                  )}

                  {/* Language Dropdown */}
                  <div
                    className="language-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="language-trigger"
                      onClick={() => setShowLangDropdown(!showLangDropdown)}
                    >
                      <img
                        src={language === "de" ? german_flag : english_flag}
                        alt={language === "de" ? "German" : "English"}
                        className="language-flag"
                      />
                      {!isMobileViewport && (
                        <span className="language-text">
                          {language === "de" ? "GER" : "ENG"}
                        </span>
                      )}
                      <i
                        className={`bi bi-chevron-down language-chevron ${
                          showLangDropdown ? "open" : ""
                        }`}
                      ></i>
                    </div>

                    {/* Language Options Dropdown */}
                    {showLangDropdown && (
                      <div className="language-options">
                        <div
                          className={`language-option ${
                            language === "de" ? "active" : ""
                          }`}
                          onClick={() => handleLanguageChange("de")}
                        >
                          <img
                            src={german_flag}
                            alt="German"
                            className="language-option-flag"
                          />
                          <span>German</span>
                          {language === "de" && (
                            <i className="bi bi-check language-option-check"></i>
                          )}
                        </div>

                        <div
                          className={`language-option ${
                            language === "en" ? "active" : ""
                          }`}
                          onClick={() => handleLanguageChange("en")}
                        >
                          <img
                            src={english_flag}
                            alt="English"
                            className="language-option-flag english"
                          />
                          <span>English</span>
                          {language === "en" && (
                            <i className="bi bi-check language-option-check"></i>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Dropdown Menu */}
                {isAuthenticated && showAccountMenu && (
                  <div className="account-dropdown">
                    <button
                      onClick={logoutUser}
                      className="btn btn-sm btn-danger logout-btn"
                    >
                      {currentLanguage.logout}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <AddressModal
        show={showAddressModal}
        handleClose={() => setShowAddressModal(false)}
        onPostcodeSelect={handlePostcodeSelect}
        shouldManageCartButton={true}
      />

      <LoginModal
        show={showLoginModal}
        handleClose={() => setShowLoginModal(false)}
      />

      {showSearchModal && (
        <div
          className="modal mobile-search-col fade show d-block mobile-search-modal"
          id="mobile-search-Modal"
          tabIndex="-1"
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <form
                  className="mobile-search-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <img
                    src="/assets/user/img/close-icon.svg"
                    className="btn-close mobile-search-close"
                    alt="Close"
                    onClick={() => setShowSearchModal(false)}
                  />
                  <input
                    type="search"
                    placeholder={`${currentLanguage.search_anything}...`}
                    value={localSearch}
                    onChange={onChangeSearch}
                    className="form-control mt-2"
                  />
                  <button type="submit" className="btn-search">
                    <img src={`assets/user/img/search-icon.svg`} alt="Search" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
