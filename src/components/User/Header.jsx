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
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchDropdownRef = useRef(null);
  const [lastQueryResults, setLastQueryResults] = useState([]);
  const [lastQuery, setLastQuery] = useState("");

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
  };

  const handlePostcodeSelect = (data) => {
    setSelectedPostcode(data.postcode);
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee);
    setPostCode(data.postcode);
  };

  // ✅ Simple input change - NO API call (removed all searchProducts API calls)
  const onChangeSearch = (valueOrEvent) => {
    const val =
      typeof valueOrEvent === "string"
        ? valueOrEvent
        : valueOrEvent?.target?.value || "";

    setLocalSearch(val);
    // That's it - bas value update karo, API call nahi
  };

  // ✅ Search trigger - Only on Enter or button click - API call + show suggestions
  const handleSearch = async () => {
    const query = localSearch.trim();
    if (!query) return;

    try {
      console.log("🔍 Header: Calling searchProducts API for suggestions...");

      const response = await searchProducts({
        query: query,
        storeId: import.meta.env.VITE_STORE_ID,
        limit: 10,
      });

      // Handle different response structures
      let products = [];
      if (response?.data) {
        products = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        products = response;
      }

      console.log("✅ Header: Products found:", products.length);

      // Cache data in localStorage for SearchResults to use
      const cacheKey = `search_cache_${query.toLowerCase()}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          query: query,
          products: products,
          timestamp: Date.now(),
        })
      );

      // Remember last successful query/results in state
      setLastQuery(query);
      setLastQueryResults(products);

      // Show suggestions dropdown
      setSearchSuggestions(products.slice(0, 10));
      setShowSuggestions(true);
    } catch (error) {
      console.error("❌ Header Search API error:", error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const openSearchPage = (query, products, selectedProductId = null) => {
    if (!query) return;

    navigate(`/search?q=${encodeURIComponent(query)}`, {
      state: {
        cachedProducts: products,
        cachedQuery: query,
        selectedProductId,
        timestamp: Date.now(),
      },
    });

    // Clear local input + dropdown
    setLocalSearch("");
    setShowSuggestions(false);
    setSearchSuggestions([]);
    setShowSearchModal(false);
  };

  // Handle suggestion click - navigate to search page with cached data
  const handleSuggestionClick = (product) => {
    const query =
      lastQuery || localSearch.trim() || product.name || product.title || "";
    const productsToSend =
      lastQueryResults.length > 0 ? lastQueryResults : searchSuggestions;

    openSearchPage(query, productsToSend, product.id);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
      if (showAccountMenu) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAccountMenu, showSuggestions]);

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
                  onEnterPress={handleSearch} // ✅ Enter key press
                  onIconClick={handleSearch}
                />

                {/* Search Suggestions Dropdown - Mobile */}
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
                  setLocalSearch("");
                  setShowSuggestions(false);
                  setSearchSuggestions([]);
                }}
                size={35}
                className="right-side-icons"
              />
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-10 col-sm-10 col-6">
                <div className="header-left-area">
                  {/* Brand logo */}
                  <div className="brand-logo-container">
                    <a className="brand-logo-Link" href={payload_url}>
                      <img
                        className="brand-logo-img"
                        src={brandLogo}
                        alt="Brand Logo"
                      />
                    </a>
                  </div>

                  {status && (
                    <div className="header-middle-area d-none d-sm-flex">
                      {/* Postcode */}
                      {order_type === "delivery" && (
                        <div
                          className="header-postcode-col"
                          onClick={() => setShowAddressModal(true)}
                        >
                          <div className="postcode-icon">
                            <LuMapPin size={25} style={{ color: "#624BA1" }} />
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

                      {/* ✅ Search bar with suggestions */}
                      <div ref={searchDropdownRef} className="search-wrapper">
                        <SearchBar
                          onSearch={onChangeSearch}
                          value={localSearch}
                          onEnterPress={handleSearch} // ✅ Enter triggers search
                          onIconClick={handleSearch}
                        />

                        {/* Search Suggestions Dropdown - Desktop */}
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
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Login/Account */}
              <div className="col-lg-2 col-sm-2 col-6">
                <div className="header-login">
                  {isMobileViewport && (
                    <IoIosSearch
                      onClick={() => setShowSearchModal(true)}
                      size={35}
                      className="right-side-icons"
                    />
                  )}

                  {/* Account/Login button */}
                  <div className="account-container">
                    {isAuthenticated ? (
                      <div
                        className="account-menu-trigger"
                        onClick={() => setShowAccountMenu((v) => !v)}
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
