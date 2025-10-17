import React from "react";
import { BiLoader } from "react-icons/bi";
import { useStoreStatus } from "../../../contexts/StoreStatusContext";
import { useViewport } from "../../../contexts/ViewportContext";

const StoreTitle = ({ isbannerShow, className = "", style = {} }) => {
  const { isMobileViewport } = useViewport();
  const { store, isOpen, hoursDisplay, isWSLoading, serverTime } =
    useStoreStatus();

  const showStoreStatus = !isWSLoading && serverTime !== null;

  if (!store) return null;

  return (
    <div
      className={`store-title-col animated-element ${className}`}
      style={{
        display: isMobileViewport && !isbannerShow ? "none" : "block",
        ...style,
      }}
    >
      <div className="restaurant-title">
        <h1>{store.name}</h1>
        <h3>
          {!showStoreStatus ? (
            <BiLoader style={{ animation: "spin 1s linear infinite" }} />
          ) : isOpen ? (
            <img
              className="storeBtn"
              src={`assets/user/img/open-btn.svg`}
              alt="Open"
            />
          ) : (
            <img
              className="storeBtn"
              src={`assets/user/img/close-btn.svg`}
              alt="Close"
            />
          )}
          {hoursDisplay}
        </h3>
      </div>
      <h5>
        {store.address}, {store.country}
      </h5>
    </div>
  );
};

export default StoreTitle;
