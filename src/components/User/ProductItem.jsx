// export default ProductItem;
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap"; // ✅ use same Modal as VariantModal
import { useCart } from "../../contexts/CartContext";
import { currentCurrency } from "../../utils/helper/currency_type";
import { getProduct } from "@/api/UserServices";
import { useLanguage } from "../../contexts/LanguageContext";

const ProductModal = ({ show, handleClose, product, data }) => {
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

const ProductItem = ({ product }) => {
  const { cartItems, addToCart, setSelectedProduct, setShowVariantModal } =
    useCart();
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  const STORE_ID = import.meta.env.VITE_STORE_ID;

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [productDetails, setProductDetails] = useState(null);

  // ─── VARIANT HANDLING ────────────────────────────────
  const [selectedVariant, setSelectedVariant] = useState(null);
  useEffect(() => {
    if (product.type === "variable" && product.variants.length) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  // ───── QUANTITY CALCULATION ─────
  const quantity = cartItems
    .filter((item) => {
      if (item.id !== product.id) return false;
      if (product.type === "simple") return true;
      return item.selectedVariant?.id === selectedVariant?.id;
    })
    .reduce((sum, item) => sum + item.quantity, 0);

  // ─── EVENT HANDLERS ──────────────────────────────────
  const handleProductClick = () => {
    if (product.enriched_topping_groups.length > 0) {
      setSelectedProduct(product);
      setShowVariantModal(true);
    } else {
      addToCart(product, selectedVariant ? selectedVariant.id : null, 1, []);
    }
  };

  const openProductInfo = async () => {
    setShowProductModal(true);

    if (product.allergy_items.length > 0) {
      return;
    }

    if (productDetails) return;
    try {
      // TODO : Remove this Extra Api Call
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
  return (
    <div className="col">
      <div className="product-cnt-col">
        <div className="prdct-text">
          <div className="mb-2">
            <button
              style={{
                display: product.allergy_items.length > 0 ? "block" : "none",
              }}
              className="product-info-btn info-btn"
              onClick={() => openProductInfo()}
            >
              Produktinfo
            </button>

            <h4 className="product-title">{product.name}</h4>
          </div>

          <p className="product-description">{product.description}</p>
        </div>

        <div className="prdct-col-footer">
          {/* PRICE */}
          {product.type === "simple" ? (
            <h5>
              {currentCurrency.symbol}{" "}
              {product.price !== null
                ? product.price.toLocaleString(currentCurrency.locale, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00"}
            </h5>
          ) : (
            <div className="variant-select">
              <h5>
                {currentCurrency.symbol}{" "}
                {product.price !== null
                  ? product.price.toLocaleString(currentCurrency.locale, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </h5>
            </div>
          )}

          {/* ADD BUTTON */}
          <div className="prdct-col-counter">
            <button
              style={{
                background: quantity > 0 && "#0c831f",
                color: quantity > 0 && "white",
              }}
              className={`add-btn ${quantity > 0 ? "added" : ""}`}
              onClick={handleProductClick}
            >
              {quantity > 0
                ? `${quantity} ${currentLanguage.added}`
                : currentLanguage.add}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Product Info Modal */}
      <ProductModal
        show={showProductModal}
        handleClose={() => setShowProductModal(false)}
        product={product}
        data={data}
      />
    </div>
  );
};

export default ProductItem;
