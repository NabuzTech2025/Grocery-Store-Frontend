import React, { useState } from "react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Search } from "lucide-react";
import { IoIosSearch } from "react-icons/io";

function DesktopSearch({ onSearch }) {
  const { translations: currentLanguage } = useLanguage();
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const onChangeSearch = (e) => {
    const val = e.target.value;
    setLocalSearchTerm(val);
    onSearch(val);
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
        className="form-control form-input desktopSearch"
        placeholder={`${currentLanguage.search_anything}...`}
        value={localSearchTerm}
        onChange={onChangeSearch}
        onFocus={(e) => {
          e.target.style.borderColor = "#007bff";
          e.target.style.boxShadow = "0 0 0 0.2rem rgba(0,123,255,.25)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#ccc";
          e.target.style.boxShadow = "none";
        }}
      />
      <IoIosSearch size={30} className="search-icon" />
    </div>
  );
}

export default DesktopSearch;
