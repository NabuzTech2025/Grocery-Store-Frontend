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

  // overlay - check if product is out of stock (only if stock field exists and is 0)
  // Helper to safely convert and check stock value
  const getStockNum = (val) => {
    if (val === undefined || val === null || val === "") return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  // Check all possible stock locations
  // We now ONLY consider quantity on hand fields for out-of-stock logic
  const variantQoh = getStockNum(
    product?.selectedVariant?.quantity_on_hand ??
      product?.selectedVariant?.quantityOnHand ??
      product?.selectedVariant?.qty_on_hand
  );
  const productQoh = getStockNum(
    product?.quantity_on_hand ?? product?.quantityOnHand ?? product?.qty_on_hand
  );

  // Determine if out of stock - strictly by qty_on_hand
  let isOutOfStock = false;

  if (variantQoh !== null) {
    isOutOfStock = variantQoh === 0;
  } else if (productQoh !== null) {
    isOutOfStock = productQoh === 0;
  }

  // Temporary debug - remove after checking
  if (product.name === "Limca") {
    console.log("Limca stock check (QOH only):", {
      variantQoh,
      productQoh,
      isOutOfStock,
      product: product,
    });
  }

  const handleImageClick = () => {
    if (onImageClick && !isOutOfStock) {
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
      className={`product-card${isOutOfStock ? " out-of-stock" : ""}`}
      // overlay
      // className={`${
      //   location.pathname === "/" ? "product-card-main-page" : "product-card"
      // }`}
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
            cursor: isOutOfStock ? "not-allowed" : "pointer", // overlay
            // borderRadius: "8px",
            // border: "2px solid #f8f9fa",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!isOutOfStock) {
              // overlay
              e.target.style.transform = "scale(1.05)";
              // e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isOutOfStock) {
              // overlay
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }
          }}
        />
        {/* overlay */}
        {isOutOfStock && (
          <div className="out-of-stock-overlay">Out of Stock</div>
        )}
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

          {/* overlay */}
          <button className="add-to-cart" disabled={isOutOfStock}>
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
