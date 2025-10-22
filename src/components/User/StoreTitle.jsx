import React, { useState, useEffect } from "react";
import { useStoreStatus } from "@/contexts/StoreStatusContext";
import { useLanguage } from "../../contexts/LanguageContext";

const StoreTitle = () => {
  const {
    store,
    todayHours = [],
    statusText,
    isOpen,
    hoursDisplay,
  } = useStoreStatus();
  const [orderType, setOrderType] = useState("delivery");
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  // Set default value once on mount
  useEffect(() => {
    const storedType = localStorage.getItem("order_type");
    if (storedType === "pickup" || storedType === "delivery") {
      setOrderType(storedType);
    } else {
      localStorage.setItem("order_type", "delivery");
      setOrderType("delivery");
    }
  }, []);

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    localStorage.setItem("order_type", type);
  };

  if (!store) {
    return (
      <div className="loading-store-title" style={{ padding: "20px", textAlign: "center" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading store...</span>
        </div>
      </div>
    );
  }

  return (
    <section
      id="store-title-area"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 999,
        backgroundColor: "#fff",
      }}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-sm-6 col-6">
            <div className="store-title-col">
              <div className="restaurant-title">
                <h1>{store.name}</h1>
                <h3>
                  {statusText && statusText == "close" && (
                    <span
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        padding: "7px 10px",
                        borderRadius: "3px",
                        marginRight: "5px",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        lineHeight: "10px",
                      }}
                    >
                      {statusText}
                    </span>
                  )}

                  {statusText && statusText == "open" && (
                    <span
                      style={{
                        backgroundColor: "green",
                        color: "white",
                        padding: "7px 10px",
                        borderRadius: "3px",
                        marginRight: "5px",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        lineHeight: "10px",
                      }}
                    >
                      {statusText}
                    </span>
                  )}

                  {hoursDisplay}
                </h3>
              </div>
              <h5>
                {store.address}, {store.country}
              </h5>
            </div>
          </div>
          <div className="col-lg-6 col-sm-6 col-6 text-end">
            <div className="select-order-type">
              <div className="order-type-button d-inline-flex">
                <button
                  type="button"
                  className={`select-type ${
                    orderType === "delivery" ? "active" : ""
                  }`}
                  onClick={() => handleOrderTypeChange("delivery")}
                >
                  {currentLanguage.delivery}
                </button>
                <button
                  type="button"
                  className={`select-type ${
                    orderType === "pickup" ? "active" : ""
                  }`}
                  onClick={() => handleOrderTypeChange("pickup")}
                >
                  {currentLanguage.pickup}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreTitle;
