import React from "react";
import { ProductSectionSkeleton } from "./ProductSectionSkeleton";

const CategorySectionSkeleton = () => {
  return (
    <div className="mb-8">
      {/* Category title skeleton with MIUI shimmer */}
      <div className="products-categroy-title-row mb-6">
        <div
          className="relative overflow-hidden bg-gray-200 rounded mb-2"
          style={{ height: "32px", width: "192px" }}
        >
          <div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
            style={{ animation: "shimmer 2s infinite" }}
          ></div>
        </div>
        <div
          className="relative overflow-hidden bg-gray-200 rounded"
          style={{ height: "16px", width: "384px" }}
        >
          <div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
            style={{ animation: "shimmer 2s infinite", animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>

      {/* Products skeleton */}
      <ProductSectionSkeleton />

      {/* Add MIUI shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export { CategorySectionSkeleton };
