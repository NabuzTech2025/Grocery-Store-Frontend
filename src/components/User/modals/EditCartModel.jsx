import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useCart } from "../../../contexts/CartContext";
import { currentCurrency } from "../../../utils/helper/currency_type";
import { useLanguage } from "../../../contexts/LanguageContext";

const EditCartModel = () => {
  const {
    selectedProduct,
    showEditProductModal,
    setShowEditProductModal,
    editCartProduct,
    cartItems,
  } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [variantSelected, setVariantSelected] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [originalUniqueKey, setOriginalUniqueKey] = useState(null);
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  useEffect(() => {
    if (showEditProductModal && selectedProduct) {
      // Store the original unique key for proper identification
      setOriginalUniqueKey(selectedProduct.uniqueKey);

      const initialSelected = [];

      // Add variant if exists
      if (selectedProduct.selectedVariant) {
        initialSelected.push(selectedProduct.selectedVariant);
        setVariantSelected(true);
      }

      // Add existing toppings from the product's extras
      if (selectedProduct.extras && selectedProduct.extras.length > 0) {
        selectedProduct.extras.forEach((extra) => {
          const toppingGroup = selectedProduct.enriched_topping_groups?.find(
            (group) => group.toppings?.some((t) => t.id === extra.id)
          );

          if (toppingGroup) {
            const topping = toppingGroup.toppings.find(
              (t) => t.id === extra.id
            );
            if (topping) {
              initialSelected.push({
                ...topping,
                quantity: extra.quantity, // Preserve the existing quantity
              });
            }
          }
        });
      }

      setSelectedItems(initialSelected);
    } else {
      setSelectedItems([]);
      setVariantSelected(false);
      setOriginalUniqueKey(null);
    }
  }, [showEditProductModal, selectedProduct]);

  const handleItemToggle = (item) => {
    if (item.isBaseProduct) return;

    const newSelectedItems = selectedItems.some((v) => v.id === item.id)
      ? selectedItems.filter((v) => v.id !== item.id)
      : [...selectedItems, { ...item, quantity: 1 }]; // Ensure quantity is set

    if (
      selectedProduct.type === "variable" &&
      selectedProduct.variants?.some((v) => v.id === item.id)
    ) {
      setVariantSelected(
        newSelectedItems.some((i) =>
          selectedProduct.variants?.some((v) => v.id === i.id)
        )
      );
    }

    setSelectedItems(newSelectedItems);
  };

  const handleSaveChanges = () => {
    if (!selectedProduct || !originalUniqueKey) return;

    // Prepare the new extras array
    const newExtras = selectedItems
      .filter(
        (item) =>
          !item.isBaseProduct &&
          !selectedProduct.variants?.some((v) => v.id === item.id)
      )
      .map((t) => ({
        id: t.id,
        quantity: t.quantity || 1,
        price: t.price,
        name: t.name,
      }));

    // Get the selected variant (if any)
    const selectedVariant = selectedItems.find((item) =>
      selectedProduct.variants?.some((variant) => variant.id === item.id)
    );

    // Update the cart item using the original unique key
    editCartProduct(
      originalUniqueKey, // Pass the original unique key
      selectedProduct.id,
      selectedVariant?.id || null,
      selectedProduct.quantity || 1,
      newExtras
    );

    handleClose();
  };

  const handleClose = () => {
    setSelectedItems([]);
    setVariantSelected(false);
    setOriginalUniqueKey(null);
    setShowEditProductModal(false);
  };

  if (!selectedProduct) return null;

  const isSimpleProduct = selectedProduct.type === "simple";
  const hasVariants = selectedProduct.variants?.length > 0;
  const hasToppings = selectedProduct.enriched_topping_groups?.some(
    (group) => group.toppings?.length > 0
  );

  const showToppingsSection = isSimpleProduct || variantSelected;
  const continueDisabled = hasVariants && !variantSelected;

  const totalPrice = (() => {
    let basePrice = isSimpleProduct
      ? selectedProduct.price
      : selectedItems
          .filter((item) =>
            selectedProduct.variants?.some((v) => v.id === item.id)
          )
          .reduce((sum, item) => sum + item.price, 0);

    let toppingTotal = selectedItems
      .filter(
        (item) => !selectedProduct.variants?.some((v) => v.id === item.id)
      )
      .reduce((sum, item) => sum + item.price, 0);

    return basePrice + toppingTotal;
  })();

  return (
    <Modal
      show={showEditProductModal}
      onHide={handleClose}
      className="centre-modal-popup"
      style={{
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      dialogStyle={{
        margin: "0",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "90vh",
        overflow: "hidden",
      }}
      contentStyle={{
        maxHeight: "90vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Modal.Header>
        <button type="button" className="btn-close" onClick={handleClose}>
          <img src={`assets/user/img/close-icon.svg`} alt="Close" />
        </button>
        <h5>
          {currentLanguage.edit} {selectedProduct.name}
        </h5>
      </Modal.Header>

      <Modal.Body
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
          overflowX: "hidden",
          flex: "1 1 auto",
          padding: "1rem",
        }}
      >
        {/* Base product for simple products */}
        {isSimpleProduct && (
          <ul className="variants-list-style">
            <li className="variants-name-list">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={true}
                  readOnly
                  id={`base-${selectedProduct.id}`}
                />
                <label
                  className="form-check-label"
                  htmlFor={`base-${selectedProduct.id}`}
                >
                  <h6>{selectedProduct.name}</h6>
                </label>
              </div>
            </li>
            <li className="variants-list-price">
              <h5>
                {currentCurrency.symbol}
                {selectedProduct.price.toFixed(2)}
              </h5>
            </li>
          </ul>
        )}

        {/* Variants section */}
        {hasVariants &&
          selectedProduct.variants?.map((variant) => {
            const isSelected = selectedItems.some((v) => v.id === variant.id);

            return (
              <ul key={variant.id} className="variants-list-style">
                <li className="variants-name-list">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleItemToggle(variant)}
                      id={`variant-${variant.id}`}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`variant-${variant.id}`}
                    >
                      <h6>{variant.name}</h6>
                    </label>
                  </div>
                </li>
                <li className="variants-list-price">
                  <h5>
                    {currentCurrency.symbol}
                    {variant.price.toFixed(2)}
                  </h5>
                </li>
              </ul>
            );
          })}

        {/* Toppings section - only show for simple products or after variant selection */}
        {showToppingsSection &&
          hasToppings &&
          selectedProduct.enriched_topping_groups
            ?.filter((group) => group.toppings?.length > 0)
            .map((group) => (
              <div key={group.id}>
                <h6 className="topping-group-title">{group.name}</h6>
                {group.toppings.map((topping) => {
                  const isSelected = selectedItems.some(
                    (v) => v.id === topping.id
                  );

                  return (
                    <ul
                      key={topping.id}
                      className="variants-list-style"
                      style={{
                        backgroundColor:
                          hoveredItemId === topping.id
                            ? "#f5f5f5"
                            : "transparent",
                        transition: "background-color 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setHoveredItemId(topping.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                      onClick={() => handleItemToggle(topping)}
                    >
                      <li className="variants-name-list">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleItemToggle(topping)}
                            id={`topping-${topping.id}`}
                          />
                          <label className="form-check-label">
                            <h6>{topping.name}</h6>
                          </label>
                        </div>
                      </li>
                      <li className="variants-list-price">
                        <h5>
                          {currentCurrency.symbol}
                          {topping.price.toFixed(2)}
                        </h5>
                      </li>
                    </ul>
                  );
                })}
              </div>
            ))}
      </Modal.Body>

      <Modal.Footer
        className="d-flex justify-content-end"
        style={{
          flexShrink: 0,
          borderTop: "1px solid #dee2e6",
          padding: "1rem",
        }}
      >
        <button
          type="button"
          className="btn variant-submit"
          onClick={handleSaveChanges}
          disabled={continueDisabled}
        >
          {totalPrice > 0
            ? `${currentLanguage.save} ${
                currentCurrency.symbol
              }${totalPrice.toFixed(2)}`
            : currentLanguage.save_changes}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCartModel;
