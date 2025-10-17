import React from "react";

// ProductCategory Skeleton
const ProductCategorySkeleton = () => {
  return (
    <ul className="sidebar hm-category-list">
      {[...Array(6)].map((_, index) => (
        <li key={`cat-skeleton-${index}`}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {/* Image skeleton with MIUI shimmer */}
            <div
              className="relative overflow-hidden bg-gray-200 rounded-lg mb-1.5"
              style={{ width: "60px", height: "60px" }}
            >
              <div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                style={{
                  animation: "shimmer 2s infinite",
                  animationDelay: `${index * 0.1}s`,
                }}
              ></div>
            </div>

            {/* Text skeleton with MIUI shimmer */}
            <div
              className="relative overflow-hidden bg-gray-200 rounded"
              style={{ height: "16px", width: "64px" }}
            >
              <div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                style={{
                  animation: "shimmer 2s infinite",
                  animationDelay: `${index * 0.1 + 0.2}s`,
                }}
              ></div>
            </div>
          </div>
        </li>
      ))}

      {/* Add MIUI shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </ul>
  );
};
export { ProductCategorySkeleton };
