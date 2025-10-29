import React from "react";
import shopTrolley from "../../../../public/assets/user/img/shopTrolley.png";
import "../../../../ui/css/HomeMain.css";
import { useCart } from "../../../contexts/CartContext";

const ProductCard = ({
  product,
  onImageClick,
  onAddToCart,
  currency = { symbol: "€", locale: "de-DE" },
}) => {
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
    <div className="product-card" onClick={handleImageClick}>
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
            // borderRadius: "8px",
            // border: "2px solid #f8f9fa",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            // e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
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
        {/* {product.weight && <p className="product-weight">{product.weight}</p>} */}
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        {/* Product Footer */}
        <div className="product-footer">
          <div className="price-container">
            <span className="current-price">
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
