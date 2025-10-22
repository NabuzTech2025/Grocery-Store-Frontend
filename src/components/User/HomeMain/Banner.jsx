import React from "react";
import { useViewport } from "../../../contexts/ViewportContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import "../../../../ui/css/HomeMain.css";

const Banner = () => {
  const { isMobileViewport } = useViewport();
  const { translations: currentLanguage } = useLanguage();

  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-md-6">
            <div className="hero-content">
              <h1 className="hero-title">
                {currentLanguage.welcome_to_store || "Welcome to Our Store"}
              </h1>
              <p className="hero-description">
                {currentLanguage.hero_description || 
                  "Get fresh groceries delivered to your doorstep. Quality products at great prices!"}
              </p>
              <div className="hero-buttons">
                <a href="/restaurant" className="btn btn-primary btn-lg">
                  {currentLanguage.shop_now || "Shop Now"}
                </a>
                <a href="/login" className="btn btn-outline-primary btn-lg">
                  {currentLanguage.login || "Login"}
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-6">
            <div className="hero-image">
              <img
                src="/assets/user/img/shop_bag.png"
                alt="Grocery Shopping"
                className="img-fluid"
                style={{
                  maxHeight: isMobileViewport ? "300px" : "400px",
                  width: "auto"
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
