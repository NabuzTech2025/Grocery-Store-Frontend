import React from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { IoIosSearch } from "react-icons/io";

function SearchBar({ onSearch, value, onEnterPress, onIconClick }) {
  const { translations: currentLanguage } = useLanguage();

  const onChangeSearch = (e) => {
    const val = e.target.value;
    onSearch(val); // Parent component ko pass karo
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onEnterPress) {
      onEnterPress(value);
    }
  };

  return (
    <div
      className="form"
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <input
        type="text"
        className="form-control form-input searchBar"
        placeholder={`${currentLanguage.search_anything}...`}
        value={value || ""} // Header se aaya hua value use karo
        onChange={onChangeSearch}
        onKeyPress={handleKeyPress}
        autoFocus
        onFocus={(e) => {
          e.target.style.borderColor = "#007bff";
          e.target.style.boxShadow = "0 0 0 0.2rem rgba(0,123,255,.25)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#ccc";
          e.target.style.boxShadow = "none";
        }}
      />
      <IoIosSearch
        size={30}
        className="search-icon"
        onClick={() => {
          if (onIconClick) {
            onIconClick();
          } else if (onEnterPress) {
            onEnterPress(value);
          }
        }}
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}

export default SearchBar;
