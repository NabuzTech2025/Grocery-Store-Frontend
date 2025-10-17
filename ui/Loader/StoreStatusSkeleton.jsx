import React from "react";

// Store Title Area Skeleton - MIUI Style
const StoreStatusSkeleton = ({ loding, hours }) => {
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
                {/* Store name skeleton */}
                <div
                  className="relative overflow-hidden bg-gray-200 rounded mb-2 "
                  style={{ height: "32px", width: "200px" }}
                >
                  <div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{ animation: "shimmer 2s infinite" }}
                  ></div>
                </div>

                {/* Status and hours skeleton */}
                <div className="flex items-center gap-4 mb-1">
                  {/* Status badge skeleton */}
                  <div
                    className="relative overflow-hidden bg-gray-200 rounded"
                    style={{ height: "24px", width: "60px" }}
                  >
                    <div
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                      style={{
                        animation: "shimmer 2s infinite",
                        animationDelay: "0.2s",
                      }}
                    ></div>
                  </div>

                  {/* Hours skeleton */}
                  <div
                    className="relative overflow-hidden bg-gray-200 rounded"
                    style={{ height: "18px", width: "120px" }}
                  >
                    <div
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                      style={{
                        animation: "shimmer 2s infinite",
                        animationDelay: "0.4s",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Address skeleton */}
              <div
                className="relative overflow-hidden bg-gray-200 rounded"
                style={{ height: "16px", width: "250px" }}
              >
                <div
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  style={{
                    animation: "shimmer 2s infinite",
                    animationDelay: "0.6s",
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-sm-6 col-6 text-end">
            <div className="select-order-type">
              <div className="order-type-button d-inline-flex">
                {/* Order type buttons skeleton */}
                <div
                  className="relative overflow-hidden bg-gray-200"
                  style={{
                    height: "40px",
                    width: "80px",
                    borderRadius: "20px",
                  }}
                >
                  <div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{
                      animation: "shimmer 2s infinite",
                      animationDelay: "0.8s",
                    }}
                  ></div>
                </div>
                <div
                  className="relative overflow-hidden bg-gray-200"
                  style={{
                    height: "40px",
                    width: "80px",
                    borderRadius: "20px",
                  }}
                >
                  <div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
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
      </div>

      {/* Add MIUI shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
};

// Store Status Loading Component (smaller version for just status updates)
const StoreStatusLoadingBadge = () => {
  return (
    <span
      style={{
        backgroundColor: "#e5e7eb",
        color: "transparent",
        padding: "7px 10px",
        borderRadius: "3px",
        marginRight: "5px",
        fontSize: "10px",
        textTransform: "uppercase",
        lineHeight: "10px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      LOADING
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
        style={{ animation: "shimmer 2s infinite" }}
      ></div>
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </span>
  );
};

export { StoreStatusSkeleton, StoreStatusLoadingBadge };
