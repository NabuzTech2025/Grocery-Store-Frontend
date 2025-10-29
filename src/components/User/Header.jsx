import React, { useState, useEffect } from "react";
import AddressModal from "../User/modals/AddressModal";
import LoginModal from "@/components/User/modals/LoginModal";
import { useAuth } from "@/auth/AuthProvider";
import { useCart } from "../../contexts/CartContext";
import { useViewport } from "../../contexts/ViewportContext";
import { payload_url } from "../../utils/common_urls";
import brandLogo from "../../../public/assets/user/img/brand-logo.png";
import userLogo from "../../../public/assets/user/img/login-icon.svg";
import { useStoreStatus } from "../../contexts/StoreStatusContext";
import "./../../../ui/css/Header.css";
import { useLanguage } from "../../contexts/LanguageContext";
import { LuMapPin } from "react-icons/lu";
import { RiUserLine } from "react-icons/ri";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import SearchBar from "./ProductArea/SearchBar";
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
        <div className="header-container">
          {showSearchModal && isMobileViewport ? (
            <div className="show-search-bar">
              <SearchBar onSearch={onChangeSearch} />
              <IoMdClose
                onClick={() => setShowSearchModal(false)}
                size={35}
                className="right-side-icons"
              />
            </div>
          ) : (
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
                              <LuMapPin
                                size={25}
                                style={{ color: "#624BA1" }}
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
                        <SearchBar
                          onSearch={() => {
                            console.log("Desktop Search");
                          }}
                        />
                      </div>

                      {/* Mobile */}
                      <div className="d-sm-none mt-2">
                        {order_type === "delivery" && (
                          <div
                            className="header-postcode-col"
                            onClick={() => setShowAddressModal(true)}
                          >
                            <div className="postcode-icon">
                              <LuMapPin
                                size={15}
                                style={{ color: "#624BA1" }}
                              />
                            </div>
                            <h3
                              className={`header-postcode-cnt mobile  ${
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
                  {isMobileViewport && (
                    <IoIosSearch
                      onClick={() => {
                        setShowSearchModal(true);
                      }}
                      size={35}
                      className="right-side-icons"
                    />
                  )}
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
                        <RiUserLine
                          size={isMobileViewport ? 35 : 40}
                          className="right-side-icons"
                        />
                        <span className="account-text">
                          {currentLanguage.login}
                        </span>
                      </a>
                    )}
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
          )}
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
    </>
  );
};

export default Header;
