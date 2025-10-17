// src/contexts/CommonContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * @typedef {Object} PostCodeData
 * @property {string} postcode
 * @property {number} minimum_order_amount
 * @property {number} delivery_fee
 * @property {number} delivery_time
 * @property {number} id
 * @property {number} store_id
 */

/**
 * @typedef {Object} CommonContextType
 * @property {PostCodeData} selectedPostCodeData
 * @property {(data: PostCodeData) => void} setPostCodeDataINContext
 */

/** @type {React.Context<CommonContextType>} */
const CommonContext = createContext();

/**
 * @param {{ children: React.ReactNode }} props
 */
export const CommonContextProvider = ({ children }) => {
  const defaultValue = {
    postcode: "",
    minimum_order_amount: 0.0,
    delivery_fee: 0.0,
    delivery_time: 0,
    id: 0,
    store_id: 0,
  };

  /** @type {[PostCodeData, React.Dispatch<React.SetStateAction<PostCodeData>>]} */
  const [selectedPostCodeData, setSelectedPostCodeData] =
    useState(defaultValue);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("postcode-data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedPostCodeData(parsed);
      } catch (err) {
        console.error("Failed to parse postcode-data from localStorage", err);
      }
    }
  }, []);

  /**
   * @param {PostCodeData} data
   */
  const setPostCodeDataINContext = (data) => {
    const safeData = {
      postcode: data.postcode || "",
      minimum_order_amount: data.minimum_order_amount || 0.0,
      delivery_fee: data.delivery_fee || 0.0,
      delivery_time: data.delivery_time || 0,
      id: data.id || 0,
      store_id: data.store_id || 0,
    };
    setSelectedPostCodeData(safeData);
    localStorage.setItem("postcode-data", JSON.stringify(safeData));
  };

  return (
    <CommonContext.Provider
      value={{
        selectedPostCodeData,
        setPostCodeDataINContext,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};

/**
 * @returns {CommonContextType}
 */
export const useCommonData = () => useContext(CommonContext);
