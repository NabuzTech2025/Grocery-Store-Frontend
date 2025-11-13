// export default ProductItem;
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap"; // ✅ use same Modal as VariantModal
import { useCart } from "../../contexts/CartContext";
import { currentCurrency } from "../../utils/helper/currency_type";
import { getProduct } from "@/api/UserServices";
import { useLanguage } from "../../contexts/LanguageContext";

import ProductCard from "./ProductArea/ProductCard";

const ProductInfoModal = ({ show, handleClose, product, data }) => {
  if (!show || !product) return null;

  const displayData = data || product;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="centre-modal-popup custom-modal"
    >
      {/* ✅ Header with left arrow + title + close button */}
      <Modal.Header className="modal-header-custom">
        {/* Left Arrow */}

        <button type="button" className="btn-close" onClick={handleClose}>
          <img src="assets/user/img/close-icon.svg" alt="Close" />
        </button>

        {/* Title + SubTitle */}
        <div className="modal-title-container">
          <h5 className="modal-title-main">Weitere Produktinformationen</h5>
          <span className="modal-title-sub">{displayData.name}</span>
        </div>

        {/* ✅ Close Button red circle with white cross */}
        <button type="button" className="btn-close" onClick={handleClose}>
          <img src={`assets/user/img/close-icon.svg`} alt="Close" />
        </button>
      </Modal.Header>

      {/* ✅ Body */}
      <Modal.Body className="modal-body-custom">
        <div className="allergene-section">
          <h6 className="allergene-title">Allergene</h6>
          {displayData.allergy_items && displayData.allergy_items.length > 0 ? (
            <ul className="allergene-list">
              {displayData.allergy_items.map((allergyItem, index) => (
                <li key={allergyItem.id || index} className="allergene-item">
                  <strong>{allergyItem.name}</strong>
                  {allergyItem.description && (
                    <div
                      className="allergene-description"
                      dangerouslySetInnerHTML={{
                        __html: allergyItem.description,
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-allergene">Keine Allergene angegeben</p>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

const ProductItem = ({ product, onOpenDetail }) => {
  const { cartItems, addToCart, setSelectedProduct, setShowVariantModal } =
    useCart();
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  const STORE_ID = import.meta.env.VITE_STORE_ID;

  // Product modal state
  const [showProductInfoModal, setShowProductInfoModal] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  // detail modal is fully controlled by parent via onOpenDetail

  // ─── VARIANT HANDLING ────────────────────────────────
  const [selectedVariant, setSelectedVariant] = useState(null);
  useEffect(() => {
    if (product.type === "variable" && product.variants.length) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  // ───── CALCULATE DISCOUNT ─────
  const getDiscountInfo = () => {
    let originalPrice = Number(product.price) || 0;
    let discountAmount = Number(product.discount_price) || 0;

    if (product.type === "variable" && selectedVariant) {
      originalPrice = Number(selectedVariant.price) || 0;
      discountAmount = Number(selectedVariant.discount_price) || 0;
    }

    const hasDiscount = discountAmount > 0;
    const finalPrice = hasDiscount
      ? originalPrice - discountAmount
      : originalPrice;

    return {
      hasDiscount,
      finalPrice,
      originalPrice,
      discount_price: discountAmount,
    };
  };

  const discountInfo = getDiscountInfo();

  // ─── EVENT HANDLERS ──────────────────────────────────
  const handleAddToCart = () => {
    if (product.enriched_topping_groups.length > 0) {
      setSelectedProduct(product);
      setShowVariantModal(true);
    } else {
      addToCart(product, selectedVariant ? selectedVariant.id : null, 1, []);
    }
  };

  const handleProductImageClick = () => {
    onOpenDetail && onOpenDetail(product);
  };

  const openProductInfo = async () => {
    setShowProductInfoModal(true);

    if (product.allergy_items.length > 0) {
      return;
    }

    if (productDetails) return;
    try {
      const res = await getProduct(STORE_ID);
      const list = res?.data ?? res ?? [];
      const found = Array.isArray(list)
        ? list.find((p) => p.id === product.id)
        : null;

      setProductDetails(found || product);
    } catch (err) {
      setProductDetails(product);
    }
  };

  const data = productDetails || product;

  // Prepare product data for ProductCard

  const productCardData = {
    ...product,
    price: discountInfo.finalPrice,
    originalPrice: discountInfo.originalPrice,
    discount_price: discountInfo.discount_price,
    // overlay - only set stock if it exists from backend (don't default to 0)
    selectedVariant: selectedVariant
      ? {
          ...selectedVariant,
          stock: selectedVariant.stock !== undefined && selectedVariant.stock !== null
            ? Number(selectedVariant.stock)
            : (selectedVariant.quantity !== undefined && selectedVariant.quantity !== null
              ? Number(selectedVariant.quantity)
              : undefined),
        }
      : null,
  };

  return (
    <div className="col-lg-3">
      {/* Product Info Button (if has allergy items) */}
      {product.allergy_items.length > 0 && (
        <button
          className="product-info-btn info-btn"
          onClick={openProductInfo}
          style={{ marginBottom: "8px" }}
        >
          Produktinfo
        </button>
      )}

      {/* Product Card */}
      <ProductCard
        product={productCardData}
        onImageClick={handleProductImageClick}
        onAddToCart={handleAddToCart}
        currency={currentCurrency}
      />

      {/* ✅ Product Info Modal */}
      <ProductInfoModal
        show={showProductInfoModal}
        handleClose={() => setShowProductInfoModal(false)}
        product={product}
        data={data}
      />

      {/* Modal is rendered once by parent ProductSection */}
    </div>
  );
};

export default ProductItem;
