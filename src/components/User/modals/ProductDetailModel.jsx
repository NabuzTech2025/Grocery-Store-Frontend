import React, { useState } from "react";
import { useCart } from "../../../contexts/CartContext";
import { currentCurrency } from "../../../utils/helper/currency_type";
import { currentLanguage } from "../../../utils/helper/lang_translate";
import { useViewport } from "../../../contexts/ViewportContext";
import "./ProductDetailModal.css";

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const { addToCart, cartItems } = useCart();
  const { isMobileViewport } = useViewport();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [lensPosition, setLensPosition] = useState({
    x: 0,
    y: 0,
    visible: false,
  });
  const [isHovering, setIsHovering] = useState(false);

  // Use actual variants from API only - no static prices
  const availableSizes =
    product.variants && product.variants.length > 0
      ? product.variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          price: variant.price,
        }))
      : [];

  // Set first size as selected by default if not already selected
  React.useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0].name);
    }
  }, [availableSizes]);

  // Get current price based on selected size from API variants
  const getCurrentPrice = () => {
    if (selectedSize && availableSizes.length > 0) {
      const variant = availableSizes.find((v) => v.name === selectedSize);
      return variant ? variant.price : product.price;
    }
    return product.price;
  };

  if (!isOpen || !product) return null;

  const format = (price) => {
    return `${currentCurrency.symbol}${price.toFixed(2)}`;
  };

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      alert("Please select a size before adding to cart");
      return;
    }

    // Find the selected size object with price
    const selectedSizeObj = availableSizes.find(
      (size) => size.name === selectedSize
    );

    // Create variant object for cart
    const variant = selectedSize
      ? {
          id: selectedSizeObj.id,
          name: selectedSize,
          price: selectedSizeObj?.price || product.price,
        }
      : null;

    // Pass the converted price to cart
    const productWithConvertedPrice = {
      ...product,
      convertedPrice: getCurrentPrice(),
    };

    addToCart(productWithConvertedPrice, variant, quantity, []);
    onClose();
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Since backend sends single image URL as string
  const productImage = product.image_url
    ? product.image_url.split("?")[0]
    : "/assets/images/default-product.png";

  return (
    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{product.name}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="row">
              {/* Product Images */}
              <div className="col-md-6">
                <div
                  className="product-image-container"
                  style={{ position: "relative" }}
                >
                  {/* Main Product Image */}
                  <img
                    src={productImage}
                    alt={product.name}
                    className="img-fluid product-zoom-image"
                    style={{
                      width: "auto",
                      height: "400px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      cursor: isMobileViewport ? "default" : "zoom-in",
                      margin: "auto",
                      display: "block",
                    }}
                    onMouseMove={
                      !isMobileViewport
                        ? (e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;

                            // Constrain lens within image bounds
                            const lensSize = 100;
                            const constrainedX = Math.max(
                              0,
                              Math.min(x - lensSize / 2, rect.width - lensSize)
                            );
                            const constrainedY = Math.max(
                              0,
                              Math.min(y - lensSize / 2, rect.height - lensSize)
                            );

                            // Update lens position
                            setLensPosition({
                              x: constrainedX,
                              y: constrainedY,
                              visible: true,
                            });

                            // Update zoomed view
                            const zoomedView =
                              document.getElementById("zoomed-view");
                            if (zoomedView) {
                              const xPercent = (x / rect.width) * 100;
                              const yPercent = (y / rect.height) * 100;
                              zoomedView.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
                            }
                          }
                        : undefined
                    }
                    onMouseEnter={
                      !isMobileViewport
                        ? () => {
                            setIsHovering(true);
                            const zoomedView =
                              document.getElementById("zoomed-view");
                            if (zoomedView) {
                              zoomedView.style.display = "block";
                              zoomedView.style.opacity = "1";
                            }
                            // Hide text content during zoom
                            const productDetails =
                              document.getElementById("product-details");
                            if (productDetails) {
                              productDetails.style.display = "none";
                            }
                          }
                        : undefined
                    }
                    onMouseLeave={
                      !isMobileViewport
                        ? () => {
                            setIsHovering(false);
                            const zoomedView =
                              document.getElementById("zoomed-view");
                            if (zoomedView) {
                              zoomedView.style.display = "none";
                              zoomedView.style.opacity = "0";
                            }
                            setLensPosition({ x: 0, y: 0, visible: false });
                            // Show text content again
                            const productDetails =
                              document.getElementById("product-details");
                            if (productDetails) {
                              productDetails.style.display = "block";
                            }
                          }
                        : undefined
                    }
                  />

                  {/* Blue Transparent Lens - Only on Desktop */}
                  {lensPosition.visible && !isMobileViewport && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${lensPosition.x}px`,
                        top: `${lensPosition.y}px`,
                        width: "100px",
                        height: "100px",
                        border: "2px dashed #007bff",
                        backgroundColor: "rgba(0, 123, 255, 0.1)",
                        borderRadius: "4px",
                        pointerEvents: "none",
                        zIndex: 999,
                        transition: "all 0.05s ease-out",
                        boxShadow: "0 0 10px rgba(0, 123, 255, 0.3)",
                      }}
                    />
                  )}

                  {/* Zoomed View - Only on Desktop */}
                  {!isMobileViewport && (
                    <div
                      id="zoomed-view"
                      style={{
                        position: "absolute",
                        top: "0",
                        right: "-450px",
                        width: "400px",
                        height: "400px",
                        backgroundImage: `url(${productImage})`,
                        backgroundSize: "800px 800px",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "0% 0%",
                        borderRadius: "8px",
                        border: "2px solid #007bff",
                        display: "none",
                        opacity: "0",
                        zIndex: 1000,
                        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                        transition: "opacity 0.2s ease-out",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="col-md-6" id="product-details">
                <div className="product-details">
                  <h3 className="product-name">{product.name}</h3>

                  <div className="product-price">
                    <span
                      className="price-display"
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#624ba1",
                      }}
                    >
                      {format(getCurrentPrice() * quantity)}
                    </span>
                  </div>

                  {/* Size Selection - Only show if variants exist */}
                  {availableSizes.length > 0 && (
                    <div className="size-selection">
                      <h6>Size:</h6>
                      <div className="size-options">
                        {availableSizes.map((variant) => (
                          <button
                            key={variant.name}
                            className={`size-option ${
                              selectedSize === variant.name ? "selected" : ""
                            }`}
                            onClick={() => setSelectedSize(variant.name)}
                          >
                            {variant.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="quantity-selector">
                    <h6>Quantity:</h6>
                    <div className="d-flex align-items-center quantity-buttons">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        style={{ width: "40px", height: "40px" }}
                      >
                        -
                      </button>
                      <span
                        className="mx-3"
                        style={{ fontSize: "18px", fontWeight: "bold" }}
                      >
                        {quantity}
                      </span>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleQuantityChange(1)}
                        style={{ width: "40px", height: "40px" }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="add-to-cart-section">
                    <button
                      type="button"
                      className="btn-close d-md-none"
                      onClick={onClose}
                      aria-label="Close"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="10 14 4 8 10 2"></polyline>
                      </svg>
                    </button>
                    <button
                      className="btn btn-primary btn-lg w-100"
                      onClick={handleAddToCart}
                      style={{
                        backgroundColor: "#624ba1",
                        borderColor: "#624ba1",
                        padding: "12px 24px",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      <img
                        src="/assets/user/img/blk-cart-icon.svg"
                        alt="Cart"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "8px",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      Add to Cart
                    </button>
                  </div>
                  <div className="product-description">
                    <h6>Description:</h6>
                    <p className="text-muted">
                      {product.description ||
                        "No description available for this product."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
