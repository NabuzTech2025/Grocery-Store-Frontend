import React from "react";
import { ProductCategorySkeleton } from "./ProductCategorySkeleton";
import { CategorySectionSkeleton } from "./CategorySectionSkeleton";

// Main Products Area Skeleton
const ProductsAreaSkeleton = () => {
  return (
    <section id="hm-product-area">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="hm-content-area">
              {/* Category sidebar skeleton */}
              <ProductCategorySkeleton />

              {/* Products section skeleton */}
              <div className="hm-product-section">
                {[...Array(3)].map((_, index) => (
                  <CategorySectionSkeleton
                    key={`category-section-skeleton-${index}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProductsAreaSkeleton };
