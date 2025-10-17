import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";

const MobileSearchBar = ({
  isVisible,
  onClose,
  searchTerm,
  onSearchChange,
}) => {
  const searchInputRef = useRef(null);
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  useEffect(() => {
    if (isVisible) {
      // Focus the input after animation completes
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 300);
    }
  }, [isVisible]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "10px 15px",
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <div
        style={{ position: "relative", display: "flex", alignItems: "center" }}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder={currentLanguage?.search || "Search..."}
          value={searchTerm}
          onChange={onSearchChange}
          style={{
            width: "100%",
            padding: "12px 40px 12px 15px", // Added right padding for close button
            border: "1px solid #ccc",
            borderRadius: "25px",
            fontSize: "16px",
            outline: "none",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#007bff";
            e.target.style.boxShadow = "0 0 0 0.2rem rgba(0,123,255,.25)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ccc";
            e.target.style.boxShadow = "none";
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            fontSize: "20px",
            color: "#666",
            cursor: "pointer",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f0f0f0";
            e.target.style.color = "#333";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#666";
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MobileSearchBar;
