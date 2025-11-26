import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AddressModal from "../User/modals/AddressModal";
import LoginModal from "@/components/User/modals/LoginModal";
import { useAuth } from "@/auth/AuthProvider";
import { useCart } from "../../contexts/CartContext";
import { useViewport } from "../../contexts/ViewportContext";
import { payload_url } from "../../utils/common_urls";
import { searchProducts } from "../../api/UserServices";
import brandLogo from "../../../public/assets/user/img/brand-logo.svg";
import userLogo from "../../../public/assets/user/img/login-icon.svg";
import { useStoreStatus } from "../../contexts/StoreStatusContext";
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
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const searchDropdownRef = useRef(null);
  const headerApiCallRef = useRef(false);

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
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on search page
  const isOnSearchPage = location.pathname === '/search';

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

  // ✅ API-BASED SEARCH WITH DEBOUNCING (NO UI FILTERING)
  const onChangeSearch = (valueOrEvent) => {
    const val =
      typeof valueOrEvent === "string"
        ? valueOrEvent
        : valueOrEvent?.target?.value || "";

    console.log("🔥 Search input:", val);

    setLocalSearch(val);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Clear suggestions if search is empty
    if (!val.trim()) {
      console.log("🔥 Empty search - clearing");
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    // Don't show dropdown or loading immediately - wait for debounce
    setIsLoadingSuggestions(false);
    setShowSuggestions(false); // Hide dropdown until API response

    // API call with 500ms debounce
    const timeoutId = setTimeout(async () => {
      // Prevent duplicate calls
      if (headerApiCallRef.current) {
        console.log("🔍 Header: Already fetching, skipping duplicate call");
        return;
      }

      // Skip API call if already on search page (SearchResults will handle it)
      if (isOnSearchPage) {
        console.log("🔍 Header: Skipping API call - already on search page");
        return;
      }

      headerApiCallRef.current = true;

      try {
        console.log("🔍 Header: Calling searchProducts API for suggestions...");

        const response = await searchProducts({
          query: val,
          storeId: import.meta.env.VITE_STORE_ID,
          limit: 10,
        });

        console.log("📦 API Response:", response);

        // Handle different response structures
        let products = [];
        if (response?.data) {
          products = Array.isArray(response.data) ? response.data : [];
        } else if (Array.isArray(response)) {
          products = response;
        }

        console.log("✅ Products found:", products.length);
        console.log("🔍 Products array:", products);

        // Always show dropdown with results or "No products found"
        const finalProducts = products.slice(0, 10);
        setSearchSuggestions(finalProducts);
        setShowSuggestions(true);
        
        console.log("📋 Final suggestions set:", finalProducts.length);
      } catch (error) {
        console.error("❌ Header Search API error:", error);
        setSearchSuggestions([]);
        setShowSuggestions(true); // Show dropdown with "No products found" message
      } finally {
        headerApiCallRef.current = false; // Reset flag
      }
    }, 500); // 500ms debounce

    setSearchTimeout(timeoutId);
  };

  // Handle suggestion click - navigate to search page
  const handleSuggestionClick = (product) => {
    const productName = product.name || product.title || "";

    // Clear any pending API calls
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    
    // Reset API call flag
    headerApiCallRef.current = false;
    
    // Clear search state
    setLocalSearch("");
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setShowSearchModal(false); // Close mobile search modal
    
    // Navigate to search page with product name (this will trigger SearchResults API)
    navigate(`/search?q=${encodeURIComponent(productName)}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      if (showLangDropdown) {
        setShowLangDropdown(false);
      }
      if (showAccountMenu) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLangDropdown, showAccountMenu]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <>
      <header id="header">
        <div className="header-container">
          {showSearchModal && isMobileViewport ? (
            <div className="show-search-bar">
              <div ref={searchDropdownRef} className="search-wrapper">
                <SearchBar 
                  onSearch={onChangeSearch} 
                  value={localSearch}
                  onEnterPress={(searchValue) => {
                    if (searchValue.trim()) {
                      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
                      setLocalSearch("");
                      setShowSuggestions(false);
                      setSearchSuggestions([]);
                      setShowSearchModal(false);
                    }
                  }}
                />

                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="search-suggestions-dropdown">
                    {searchSuggestions.length > 0 ? (
                      searchSuggestions.map((product, index) => (
                        <div
                          key={product.id || index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(product)}
                        >
                          <IoIosSearch size={20} />
                          <span>{product.name || product.title}</span>
                        </div>
                      ))
                    ) : (
                      <div className="suggestion-item no-results">
                        <span>No products found</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <IoMdClose
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchSuggestions([]);
                  setShowSuggestions(false);
                  setLocalSearch("");
                }}
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

                        <div ref={searchDropdownRef} className="search-wrapper">
                          <SearchBar
                            onSearch={onChangeSearch}
                            value={localSearch}
                            onEnterPress={(searchValue) => {
                              if (searchValue.trim()) {
                                navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
                                setLocalSearch("");
                                setShowSuggestions(false);
                                setSearchSuggestions([]);
                              }
                            }}
                          />

                          {/* Search Suggestions Dropdown - Desktop */}
                          {showSuggestions && (
                            <div className="search-suggestions-dropdown">
                              {searchSuggestions.length > 0 ? (
                                searchSuggestions.map((product, index) => (
                                  <div
                                    key={product.id || index}
                                    className="suggestion-item"
                                    onClick={() =>
                                      handleSuggestionClick(product)
                                    }
                                  >
                                    <IoIosSearch size={20} />
                                    <span>{product.name || product.title}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="suggestion-item no-results">
                                  <span>No products found</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
                        {!isMobileViewport && user?.customer_name && (
                          <span className="account-text">
                            {user.customer_name}
                          </span>
                        )}
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
