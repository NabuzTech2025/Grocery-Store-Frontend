const ProductSectionSkeleton = () => {
  return (
    <div className="row row-cols-5">
      {[...Array(10)].map((_, index) => (
        <div key={`product-skeleton-${index}`} className="col">
          <div className="product-cnt-col">
            {/* Product Image Skeleton - MIUI Style */}
            <div className="prdct-img relative overflow-hidden">
              <div
                className="img-fluid bg-gray-200 relative overflow-hidden"
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: "8px",
                }}
              >
                {/* MIUI shimmer effect */}
                <div
                  className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  style={{
                    animation: "shimmer 2s infinite",
                  }}
                ></div>
              </div>
            </div>

            {/* Product Text Skeleton */}
            <div className="prdct-text" style={{ padding: "10px 0" }}>
              {/* Product Name Skeleton */}
              <div
                className="relative overflow-hidden bg-gray-200 rounded mb-2"
                style={{ height: "20px" }}
              >
                <div
                  className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  style={{
                    animation: "shimmer 2s infinite",
                    animationDelay: "0.2s",
                  }}
                ></div>
              </div>

              {/* Product Description Skeleton - 2 lines */}
              <div className="space-y-1">
                <div
                  className="relative overflow-hidden bg-gray-200 rounded"
                  style={{ height: "14px" }}
                >
                  <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{
                      animation: "shimmer 2s infinite",
                      animationDelay: "0.4s",
                    }}
                  ></div>
                </div>
                <div
                  className="relative overflow-hidden bg-gray-200 rounded"
                  style={{ height: "14px", width: "80%" }}
                >
                  <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{
                      animation: "shimmer 2s infinite",
                      animationDelay: "0.6s",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Product Footer Skeleton */}
            <div
              className="prdct-col-footer"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "10px",
              }}
            >
              {/* Price Skeleton */}
              <div
                className="relative overflow-hidden bg-gray-200 rounded"
                style={{ height: "18px", width: "60px" }}
              >
                <div
                  className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  style={{
                    animation: "shimmer 2s infinite",
                    animationDelay: "0.8s",
                  }}
                ></div>
              </div>

              {/* Add Button Skeleton */}
              <div className="prdct-col-counter">
                <div
                  className="relative overflow-hidden bg-gray-200 rounded"
                  style={{
                    height: "32px",
                    width: "50px",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{
                      animation: "shimmer 2s infinite",
                      animationDelay: "1s",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

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

export { ProductSectionSkeleton };
