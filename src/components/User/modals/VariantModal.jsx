import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useCart } from "../../../contexts/CartContext";
import { currentCurrency } from "../../../utils/helper/currency_type";
import { useLanguage } from "../../../contexts/LanguageContext";

const VariantModal = () => {
  const {
    selectedProduct,
    showVariantModal,
    setShowVariantModal,
    addToCart,
    updateItemWithExtras,
    findExistingItem,
  } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [existingCartItem, setExistingCartItem] = useState(null);
  const [variantSelected, setVariantSelected] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  const handleItemToggle = (item) => {
    if (item.isBaseProduct) return; // Don't allow unselecting base product

    const newSelectedItems = selectedItems.some((v) => v.id === item.id)
      ? selectedItems.filter((v) => v.id !== item.id)
      : [...selectedItems, { ...item }];

    // Check if this is a variant selection for variable products
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

  const handleAdd = () => {
    const toppings = selectedItems.filter(
      (item) =>
        !item.isBaseProduct &&
        selectedProduct.variants?.every((variant) => variant.id !== item.id)
    );

    const variants = selectedItems.filter((item) =>
      selectedProduct.variants?.some((variant) => variant.id === item.id)
    );

    const itemToppings = toppings.map((t) => ({
      id: t.id,
      quantity: 1,
      price: t.price,
      name: t.name,
    }));

    if (selectedProduct.type === "variable" && variants.length > 0) {
      variants.forEach((variant) => {
        const existingItem = findExistingItem(
          selectedProduct.id,
          variant.id,
          itemToppings
        );

        if (existingItem) {
          updateItemWithExtras(selectedProduct.id, variant.id, 1, itemToppings);
        } else {
          addToCart(selectedProduct, variant, 1, itemToppings);
        }
      });
    } else if (selectedProduct.type === "simple") {
      const existingItem = findExistingItem(
        selectedProduct.id,
        null,
        itemToppings
      );

      if (existingItem) {
        // Update existing item with both main quantity and extras quantities
        updateItemWithExtras(selectedProduct.id, null, 1, itemToppings);
      } else {
        addToCart(selectedProduct, null, 1, itemToppings);
      }
    }

    handleClose();
  };

  const handleClose = () => {
    setSelectedItems([]);
    setExistingCartItem(null);
    setShowVariantModal(false);
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
    let toppingTotal = selectedItems
      .filter(
        (item) => !selectedProduct.variants?.some((v) => v.id === item.id)
      )
      .reduce((sum, item) => sum + item.price, 0);

    if (isSimpleProduct) {
      return selectedProduct.price + toppingTotal;
    }

    return (
      toppingTotal +
      selectedItems
        .filter((item) =>
          selectedProduct.variants?.some((v) => v.id === item.id)
        )
        .reduce((sum, item) => sum + item.price, 0)
    );
  })();

  return (
    <Modal
      show={showVariantModal}
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
        <h5>{selectedProduct.name}</h5>
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
          onClick={handleAdd}
          disabled={continueDisabled}
        >
          {totalPrice > 0
            ? `${currentLanguage.view_cart} ${
                currentCurrency.symbol
              }${totalPrice.toFixed(2)}`
            : currentLanguage.continue}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default VariantModal;
