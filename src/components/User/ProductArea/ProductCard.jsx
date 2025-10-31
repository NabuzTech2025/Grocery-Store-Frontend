import React, { use } from "react";
import shopTrolley from "../../../../public/assets/user/img/shopTrolley.png";
import { useCart } from "../../../contexts/CartContext";
import { useLocation } from "react-router-dom";

const ProductCard = ({
  product,
  onImageClick,
  onAddToCart,
  currency = { symbol: "€", locale: "de-DE" },
}) => {
  const location = useLocation();
  // Calculate discount info
  const getDiscountInfo = () => {
    if (product.discount) {
      // If discount is already formatted (like "25% OFF")
      return {
        hasDiscount: true,
        discountLabel: product.discount,
        finalPrice: product.price,
        originalPrice: product.originalPrice,
      };
    }

    // Calculate discount from raw data
    let originalPrice = Number(product.originalPrice || product.price) || 0;
    let discountAmount = Number(product.discount_price) || 0;

    const hasDiscount = discountAmount > 0;
    const finalPrice = hasDiscount
      ? originalPrice - discountAmount
      : originalPrice;
    const discountPercentage = hasDiscount
      ? Math.round((discountAmount / originalPrice) * 100)
      : 0;

    return {
      hasDiscount,
      discountLabel: hasDiscount ? `${discountPercentage}% OFF` : null,
      finalPrice,
      originalPrice,
    };
  };

  const { getProductQuantity } = useCart();

  const { hasDiscount, discountLabel, finalPrice, originalPrice } =
    getDiscountInfo();

  // Calculate quantity if showQuantity is enabled
  const quantity = getProductQuantity(
    product.id,
    product.selectedVariant?.id,
    product.type
  );

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(product);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const formatPrice = (price) => {
    return (price ?? 0).toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      className={`product-card ${location.pathname === "/" ? "main-page" : ""}`}
      onClick={handleImageClick}
    >
      {/* Discount Badge */}
      {hasDiscount && discountLabel && (
        <div className="discount-badge">{discountLabel}</div>
      )}

      {/* Product Image */}
      <div className="product-image">
        <img
          src={
            product.image_url
              ? product.image_url.split("?")[0]
              : "/assets/images/default-product.png"
          }
          alt={product.name}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.description && (
          <p className="product-description">
            {String(product.description).slice(0, 20) + "..."}
          </p>
        )}

        {/* Product Footer */}
        <div className="product-footer">
          <div className="price-container">
            <span
              className={`${
                hasDiscount ? "current-price-discount" : "current-price"
              }`}
            >
              {currency.symbol} {formatPrice(finalPrice || product.price)}
            </span>
            {hasDiscount && originalPrice && (
              <span className="original-price">
                {currency.symbol} {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <button className="add-to-cart">
            {quantity > 0 && (
              <span className="product-quantity">{quantity}</span>
            )}
            <img
              style={{ width: "25px", height: "25px" }}
              src={shopTrolley}
              alt="Add to cart"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
