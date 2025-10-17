import React from "react";
import loaderBombay from "../public/assets/images/loader-bombay.png";
import "./Suspense_Loader.css";

function Suspense_Loader() {
  return (
    <div className="preloader">
      <div className="loading-container">
        <div className="loading"></div>
        <div id="loading-icon">
          <img src={loaderBombay} alt="Loading..." />
        </div>
      </div>
    </div>
  );
}

export default Suspense_Loader;
