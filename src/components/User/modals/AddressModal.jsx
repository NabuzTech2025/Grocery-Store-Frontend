import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useCommonData } from "../../../contexts/CommonContext";
import { currentCurrency } from "../../../utils/helper/currency_type";
import { useStoreStatus } from "../../../contexts/StoreStatusContext";
import "../../../../ui/css/AddressModal.css";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useCart } from "../../../contexts/CartContext";

const AddressModal = ({
  show,
  handleClose,
  onPostcodeSelect,
  shouldManageCartButton = true,
}) => {
  const [selectedPostcode, setSelectedPostcode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPostcodes, setFilteredPostcodes] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const prevShowRef = useRef(show);
  const { translations: currentLanguage } = useLanguage();
  const { setPostCodeDataINContext } = useCommonData();
  const { setShowCartButton } = useCart();

  // Get postcodes from context
  const { allPostCodes, postCodesLoading } = useStoreStatus();

  useEffect(() => {
    // Only run if show prop actually changed (not just re-renders)
    if (prevShowRef.current !== show) {
      prevShowRef.current = show;

      // Only manage cart button if shouldManageCartButton is true (i.e., opened from Header)
      if (shouldManageCartButton) {
        if (show) {
          setShowCartButton(false);
        } else {
          setShowCartButton(true);
        }
      }
    }
  }, [show, shouldManageCartButton, setShowCartButton]);

  useEffect(() => {
    if (!show) return;

    // Initialize filtered postcodes from context
    setFilteredPostcodes(allPostCodes);

    const savedPostcode = localStorage.getItem("delivery_postcode");
    if (
      savedPostcode &&
      allPostCodes.find((p) => p.postcode === savedPostcode)
    ) {
      setSelectedPostcode(savedPostcode);
      setSearchTerm(savedPostcode);
    }
  }, [show, allPostCodes]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPostcodes(allPostCodes);
      setFocusedIndex(-1);
    } else {
      const filtered = allPostCodes.filter((postcode) =>
        postcode.postcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPostcodes(filtered);
      setFocusedIndex(-1);
    }
  }, [searchTerm, allPostCodes]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    if (!allPostCodes.find((p) => p.postcode === value)) {
      setSelectedPostcode("");
    }
  };

  const handlePostcodeSelect = (postcode) => {
    setSelectedPostcode(postcode.postcode);
    setSearchTerm(postcode.postcode);
    setShowDropdown(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredPostcodes.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredPostcodes.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredPostcodes.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredPostcodes.length) {
          handlePostcodeSelect(filteredPostcodes[focusedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = (e) => {
    if (!dropdownRef.current?.contains(e.relatedTarget)) {
      setTimeout(() => setShowDropdown(false), 150);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedData = allPostCodes.find(
      (p) => p.postcode === selectedPostcode
    );
    if (selectedData) {
      setPostCodeDataINContext(selectedData);
      localStorage.setItem("delivery_postcode", selectedData.postcode);
      localStorage.setItem("delivery_fee", selectedData.delivery_fee || 0);
      onPostcodeSelect(selectedData);
      handleClose();
    }
  };

  const resetModal = () => {
    setSearchTerm("");
    setSelectedPostcode("");
    setShowDropdown(false);
    setFocusedIndex(-1);
    handleClose();
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedPostcode("");
    setShowDropdown(true);
    inputRef.current?.focus();
  };

  // Don't render the modal at all if it's not supposed to be shown
  if (!show) {
    return null;
  }

  return (
    <>
      <Modal
        show={show}
        onHide={resetModal}
        className="address-modal"
        backdrop="static"
        keyboard={false}
        centered
        size="md"
      >
        <div className="modal-content">
          <Modal.Header>
            <h5 className="modal-title">
              📍 {currentLanguage.select_your_address}
            </h5>
            <button type="button" className="btn-close" onClick={resetModal}>
              <img src={`assets/user/img/close-icon.svg`} alt="Close" />
            </button>
          </Modal.Header>

          <Modal.Body>
            <form onSubmit={handleSubmit}>
              <div className="search-container">
                <div
                  className={`search-input-wrapper ${
                    showDropdown && filteredPostcodes.length > 0
                      ? "has-results"
                      : ""
                  }`}
                >
                  <div className="location-icon">
                    <img
                      src={`assets/user/img/location-icon.svg`}
                      alt="Location"
                    />
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder={`Search for your ${currentLanguage.postCode.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                  />

                  {postCodesLoading ? (
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                    </div>
                  ) : searchTerm ? (
                    <button
                      type="button"
                      className="clear-btn"
                      onClick={clearSearch}
                    >
                      ✕
                    </button>
                  ) : null}
                </div>

                {showDropdown && (
                  <div className="dropdown-results" ref={dropdownRef}>
                    {filteredPostcodes.length > 0 ? (
                      filteredPostcodes.map((postcode, index) => (
                        <button
                          key={postcode.id}
                          type="button"
                          className={`dropdown-item ${
                            selectedPostcode === postcode.postcode
                              ? "selected"
                              : ""
                          } ${focusedIndex === index ? "focused" : ""}`}
                          onClick={() => handlePostcodeSelect(postcode)}
                          onMouseEnter={() => setFocusedIndex(index)}
                        >
                          <span className="postcode-text">
                            {postcode.postcode}
                          </span>
                          <div>
                            <span className="delivery-fee">
                              {currentCurrency.symbol}
                              {postcode.delivery_fee.toFixed(2)}
                            </span>
                            <span className="delivery-fee">
                              {postcode.delivery_time + "m"}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : searchTerm ? (
                      <div className="no-results">
                        🔍 No postcodes found matching "{searchTerm}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="submit-section">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={!selectedPostcode}
                >
                  {currentLanguage.continue}
                  <img
                    src={`assets/user/img/right-arrow-icon.svg`}
                    alt="Submit"
                  />
                </button>
              </div>
            </form>
          </Modal.Body>
        </div>
      </Modal>
    </>
  );
};

export default AddressModal;
