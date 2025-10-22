import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategory } from "@/api/UserServices";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useViewport } from "../../../contexts/ViewportContext";
import "../../../../ui/css/HomeMain.css";

const FeaturedProducts = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { translations: currentLanguage } = useLanguage();
  const { isMobileViewport } = useViewport();

  const STORE_ID = import.meta.env.VITE_STORE_ID || "1"; // Fallback store ID

  useEffect(() => {
    // Simple static categories for HomeMain page
    setCategories([
      { id: 1, name: "Fruits", image_url: "/assets/images/default-category.png" },
      { id: 2, name: "Vegetables", image_url: "/assets/images/default-category.png" },
      { id: 3, name: "Dairy", image_url: "/assets/images/default-category.png" },
      { id: 4, name: "Bakery", image_url: "/assets/images/default-category.png" },
      { id: 5, name: "Meat", image_url: "/assets/images/default-category.png" },
      { id: 6, name: "Beverages", image_url: "/assets/images/default-category.png" }
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section className="featured-products py-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-products py-5">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2 className="section-title text-center mb-5">
              {currentLanguage.featured_categories || "Featured Categories"}
            </h2>
          </div>
        </div>
        
        <div className="row">
          {categories && Array.isArray(categories) && categories.length > 0 ? categories.map((category) => (
            <div 
              key={category.id} 
              className={`col-lg-2 col-md-3 col-sm-4 col-6 mb-4 ${
                isMobileViewport ? "text-center" : ""
              }`}
            >
              <Link 
                to="/restaurant" 
                className="category-card text-decoration-none"
                style={{
                  display: "block",
                  padding: isMobileViewport ? "10px" : "20px",
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                }}
              >
                <div className="category-image mb-3">
                  <img
                    src={
                      category.image_url
                        ? `${category.image_url.split("?")[0]}`
                        : "/assets/images/default-category.png"
                    }
                    alt={category.name}
                    style={{
                      width: isMobileViewport ? "60px" : "80px",
                      height: isMobileViewport ? "60px" : "80px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "2px solid #f8f9fa"
                    }}
                  />
                </div>
                <h6 
                  className="category-name mb-0"
                  style={{
                    fontSize: isMobileViewport ? "12px" : "14px",
                    fontWeight: "600",
                    color: "#333",
                    lineHeight: "1.3"
                  }}
                >
                  {isMobileViewport && category.name.length > 12
                    ? category.name.substring(0, 12) + "..."
                    : category.name}
                </h6>
              </Link>
            </div>
          )) : (
            <div className="col-12 text-center">
              <p className="text-muted">No categories available</p>
            </div>
          )}
        </div>

        <div className="row mt-4">
          <div className="col-12 text-center">
            <Link 
              to="/restaurant" 
              className="btn btn-primary btn-lg"
              style={{
                padding: "12px 30px",
                borderRadius: "25px",
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {currentLanguage.view_all_categories || "View All Categories"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
