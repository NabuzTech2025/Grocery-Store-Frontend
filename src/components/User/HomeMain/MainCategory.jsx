import React, { use, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useViewport } from "../../../contexts/ViewportContext";
import "../../../../ui/css/HomeMain.css";
import { useCategories } from "../../../Hooks/useProductData.js";
import { useStoreStatus } from "../../../contexts/StoreStatusContext";
import CartButton from "../CartButton.jsx";
import CartModal from "../modals/CartModal.jsx";

const MainCategory = () => {
  const { translations: currentLanguage } = useLanguage();
  const { isMobileViewport } = useViewport();
  const { serverTime } = useStoreStatus();
  const {
    data: categoriesData = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    isFetching: categoriesFetching,
  } = useCategories(serverTime);
  const navigate = useNavigate();

  // Filter and sort categories
  const categories = useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) return [];

    return categoriesData
      .filter((category) => category.isActive) // Only show active categories
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)); // Sort by display_order
  }, [categoriesData]);

  // Loading state
  if (categoriesLoading || categoriesFetching) {
    return (
      <section className="main-category py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </section>
    );
  }

  // Error state
  if (categoriesError) {
    return (
      <section className="main-category py-5 text-center">
        <div className="alert alert-danger" role="alert">
          Error loading categories: {categoriesError.message}
        </div>
      </section>
    );
  }

  return (
    <section className="main-category">
      <div className="mainCategory-container">
        <div className="row g-2">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="col-lg-8per mb-3">
                <div
                  onClick={() => {
                    navigate("/store", {
                      state: { selectedCategoryId: category.id },
                    });
                  }}
                  className="category-card"
                >
                  <div className="category-image">
                    <img
                      src={
                        category.image_url
                          ? category.image_url.split("?")[0] // Remove query params for cleaner URL
                          : "/assets/images/default-category.png"
                      }
                      alt={category.name}
                      className="category-img"
                      onError={(e) => {
                        // Fallback image if loading fails
                        e.target.src = "/assets/images/default-category.png";
                      }}
                    />
                  </div>
                  <h6 className="category-name">{category.name}</h6>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">No categories available</p>
            </div>
          )}
        </div>
      </div>
      <CartButton />
      <CartModal />
    </section>
  );
};

export default MainCategory;
