import React, { useEffect, useState } from "react";
import { useCart } from "../../../contexts/CartContext";
import { getDisscount } from "@/api/UserServices";
import AddressModal from "./AddressModal";
import EditCartModel from "../../../components/User/modals/EditCartModel";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { formatCurrencySync } from "../../../utils/helper/lang_translate";
import { useCommonData } from "../../../contexts/CommonContext";
import { useViewport } from "../../../contexts/ViewportContext";
import AddNoteModal from "./AddNote";
import OrderTypeButtons from "../ProductArea/OrderTypeButtons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { Edit, Edit2 } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { useStoreStatus } from "../../../contexts/StoreStatusContext";
const CartModal = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    setSelectedProduct,
    setShowEditProductModal,
    cartTotal,
    orderNote,
    setOrderNote,
    generateCartItemKey,
    setShowCartButton,
  } = useCart();
  const { language, translations: currentLanguage } = useLanguage();
  const [deliveryFee, setDeliveryFee] = useState(3);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isMobileViewport } = useViewport();
  const { isOpen, postCode, setPostCode, orderType, setOrderType, discounts } =
    useStoreStatus();
  const { selectedPostCodeData } = useCommonData();
  const navigate = useNavigate();

  // --- UPDATE: Currency formatting helper ---
  const format = (amount) => formatCurrencySync(amount, language);

  // Clean up modal backdrop when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  useEffect(() => {
    const modalEl = document.getElementById("cartModal");
    const fetchData = () => {
      const storedOrderType = localStorage.getItem("order_type") || "delivery";
      if (orderType !== storedOrderType) setOrderType(storedOrderType);

      if ((orderType || storedOrderType) === "pickup") {
        setDeliveryFee(0);
      } else {
        if (!postCode) {
          const storedPostcode = localStorage.getItem("delivery_postcode");
          if (storedPostcode) setPostCode(storedPostcode);
        }
        setDeliveryFee(parseFloat(localStorage.getItem("delivery_fee")) || 0);
      }
    };

    modalEl?.addEventListener("shown.bs.modal", fetchData);
    return () => {
      modalEl?.removeEventListener("shown.bs.modal", fetchData);
    };
  }, [postCode, setPostCode, orderType, setOrderType]);

  useEffect(() => {
    if (showAddressModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddressModal]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setOrderNote("");
    }
  }, [cartItems, setOrderNote]);

  const handlePostcodeSelect = (data) => {
    setPostCode(data.postcode);
    setDeliveryFee(data.delivery_fee);
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee.toString());
    setShowCartButton(true);
    setShowAddressModal(false);
    showCartModal();
  };

  const getCartItemKey = (item) =>
    item.uniqueKey ||
    generateCartItemKey(item.id, item.selectedVariant?.id, item.extras);

  const hideCartModal = () => {
    const el = document.getElementById("cartModal");
    if (!el) return;
    // get existing or create instance safely
    // eslint-disable-next-line no-undef
    const inst =
      bootstrap.Modal.getInstance(el) ||
      bootstrap.Modal.getOrCreateInstance(el);
    inst.hide();
  };

  const showCartModal = () => {
    const el = document.getElementById("cartModal");
    if (!el) return;
    // eslint-disable-next-line no-undef
    const inst =
      bootstrap.Modal.getInstance(el) ||
      bootstrap.Modal.getOrCreateInstance(el);
    inst.show();
  };

  const handleShowAddressModal = () => {
    hideCartModal();
    if (orderType === "delivery" && cartItems.length > 0) {
      setShowCartButton(false);
      setShowAddressModal(true);
    }
  };

  const handleCheckout = () => {
    hideCartModal();
    if (orderType === "delivery" && !postCode && cartItems.length > 0) {
      setShowAddressModal(true);
      return;
    }
    if (!isAuthenticated) {
      navigate("/guest-login");
      return;
    }
    if (orderType === "delivery" && !postCode) {
      setShowAddressModal(true);
      return;
    }
    navigate("/update-address", {
      state: { orderType, postcode: postCode, deliveryFee },
    });
  };

  const handleCloseModal = () => {
    hideCartModal();
    if (cartItems.length === 0) setOrderNote("");
  };

  const min_order_amount =
    Number(selectedPostCodeData.minimum_order_amount) -
    Number(cartTotal.subtotal);

  // === NOTE MODAL OPEN/CLOSE/SAVE (important bits) ===
  const handleAddNoteClick = () => {
    // Hide the cart modal first to avoid two active modals & focus trap conflicts
    hideCartModal();
    setShowNoteModal(true);
  };

  const handleNoteModalClose = () => {
    setShowNoteModal(false);
    // Re-open the cart modal so user returns smoothly
    showCartModal();
  };

  const handleNoteSave = (note) => {
    console.log("Order Note from cart Model ========>", note);
    setOrderNote(note);
    setShowNoteModal(false);
    // Return to cart modal
    showCartModal();
  };
  return (
    <>
      <div
        className={`modal cart-modal-popup fade ${
          showAddressModal ? "d-none" : ""
        }`}
        id="cartModal"
        tabIndex="-1"
        aria-labelledby="cartModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            {isMobileViewport && (
              <OrderTypeButtons overrideClassName="order-type-button-cartmodel" />
            )}

            <div className="modal-header modal-header-flex">
              {/* Left side - postcode info */}
              <div className="modal-header-left">
                {orderType === "delivery" && (
                  <div
                    className="cart-postcode-col"
                    onClick={handleShowAddressModal}
                  >
                    <div className="postcode-icon">
                      <img
                        src={`assets/user/img/delivery-icon.svg`}
                        alt="Delivery"
                      />
                    </div>
                    <div className="header-postcode-cnt">
                      <h3 className={isMobileViewport ? "mobile" : ""}>
                        {postCode || currentLanguage.postCode}
                      </h3>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - buttons */}
              <div className="modal-header-right">
                <button
                  className={`add-note-button ${
                    isMobileViewport ? "mobile" : ""
                  }`}
                  onClick={handleAddNoteClick}
                >
                  <Edit size={15} />
                  {orderNote
                    ? currentLanguage.edit_note
                    : currentLanguage.add_note}
                </button>

                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <img src={`assets/user/img/close-icon.svg`} alt="Close" />
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div onClick={handleAddNoteClick} className="note-herder">
                <div className="note-header-wrapper">
                  <Edit2 size={15} className="note-icon" />
                  <h6 className="note-header">Note:-</h6>
                </div>
                <p className="note-content">{String(orderNote)}</p>
              </div>
              <div className="cart-content-area">
                {min_order_amount > 0 && orderType === "delivery" && (
                  <div className="min-order-banner">
                    <img
                      src="assets/images/shop_bag.png"
                      alt=""
                      className="min-order-icon"
                    />
                    <span
                      className={`min-order-text ${
                        isMobileViewport ? "mobile" : ""
                      }`}
                    >
                      Noch{" "}
                      <span className="min-order-amount">
                        {format(min_order_amount)}
                      </span>
                      &nbsp; bis der Mindestbestellwert erreicht ist
                    </span>
                  </div>
                )}
                {cartItems.length > 0 ? (
                  <>
                    <ul className="cart-content-header">
                      <li className="items-col">
                        <h5>{currentLanguage.items}</h5>
                      </li>
                      <li className="qty-col">
                        <h5>{currentLanguage.qty}</h5>
                      </li>
                      <li className="price-col">
                        <h5>{currentLanguage.price}</h5>
                      </li>
                    </ul>

                    {cartItems.map((item) => {
                      const toppingsTotal =
                        item.extras?.reduce(
                          (sum, t) => sum + (t.price || 0) * (t.quantity || 1),
                          0
                        ) || 0;
                      const mainProductTotal =
                        item.displayPrice * item.quantity;
                      const totalPrice =
                        mainProductTotal + toppingsTotal * item.quantity;

                      return (
                        <div
                          className="cart-items-area"
                          key={getCartItemKey(item)}
                        >
                          <div className="cart-item-col">
                            <div>
                              <a
                                href="/adria#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeFromCart(
                                    item.id,
                                    item.selectedVariant?.id || null,
                                    item.extras || [],
                                    item.uniqueKey
                                  );
                                }}
                              >
                                <img
                                  src={`assets/user/img/red-close-icon.svg`}
                                  alt="Remove"
                                />
                              </a>
                            </div>
                            {!isMobileViewport &&
                              (item.type !== "simple" ||
                                (item.extras && item.extras.length > 0)) && (
                                <a
                                  href="/adria#"
                                  className="text-decoration-underline text-primary cart-edit-text"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const productWithExtras = {
                                      ...item,
                                      enriched_topping_groups:
                                        item.enriched_topping_groups || [],
                                    };
                                    setSelectedProduct(productWithExtras);
                                    setShowEditProductModal(true);
                                  }}
                                >
                                  {currentLanguage.edit}
                                </a>
                              )}

                            <div className="cart-item-text">
                              <h6>{item.name}</h6>
                              <span>
                                {item.quantity} ×{" "}
                                {item.selectedVariant?.name || "Standard"} [
                                {format(item.displayPrice)}]
                              </span>

                              {item.extras?.length > 0 &&
                                item.extras.map((t, i) => (
                                  <div key={t.id || i}>
                                    <span>
                                      {t.quantity} × {t.name} [
                                      {format(t.price * t.quantity)}]
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="cart-items-counter">
                            <div className="cart-counter-text">
                              <span
                                onClick={() => {
                                  if (item.quantity === 1) {
                                    removeFromCart(
                                      item.id,
                                      item.selectedVariant?.id || null,
                                      item.extras || [],
                                      item.uniqueKey
                                    );
                                  } else {
                                    updateQuantity(
                                      item.id,
                                      item.selectedVariant?.id || null,
                                      item.quantity - 1,
                                      item.extras,
                                      item.uniqueKey
                                    );
                                  }
                                }}
                              >
                                <img
                                  src={`assets/user/img/minus-icon.svg`}
                                  alt="Decrease"
                                />
                              </span>

                              <span className="qty">{item.quantity}</span>

                              <span
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.selectedVariant?.id || null,
                                    item.quantity + 1,
                                    item.extras,
                                    item.uniqueKey
                                  )
                                }
                              >
                                <img
                                  src={`assets/user/img/plus-icon.svg`}
                                  alt="Increase"
                                />
                              </span>
                            </div>
                          </div>

                          <div className="cart-items-price">
                            <h4>{format(totalPrice)}</h4>

                            {/* Mobile Edit Button */}
                            {isMobileViewport &&
                              (item.type !== "simple" ||
                                (item.extras && item.extras.length > 0)) && (
                                <a
                                  href="/adria#"
                                  className="text-decoration-underline text-primary cart-mobile-edit"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const productWithExtras = {
                                      ...item,
                                      enriched_topping_groups:
                                        item.enriched_topping_groups || [],
                                    };
                                    setSelectedProduct(productWithExtras);
                                    setShowEditProductModal(true);
                                  }}
                                >
                                  {currentLanguage.edit}
                                </a>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="empty-cart-message">
                    <p>{currentLanguage.your_cart_is_empty}</p>
                  </div>
                )}
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className="modal-footer">
                <div className="cart-area-total">
                  <ul>
                    <li>
                      <h6>{currentLanguage.subtotal}</h6>
                      <span>{format(cartTotal.subtotal)}</span>
                    </li>

                    {cartTotal.discountAmount > 0 && (
                      <li>
                        <h6>
                          {currentLanguage.discount}{" "}
                          <label>
                            {currentLanguage.saved}{" "}
                            {orderType === "delivery"
                              ? discounts.delivery.value
                              : discounts.pickup.value}{" "}
                            %
                          </label>
                        </h6>
                        <span>{format(cartTotal.discountAmount)}</span>
                      </li>
                    )}

                    {deliveryFee > 0 && orderType === "delivery" && (
                      <li>
                        <h6>{currentLanguage.delivery_charges}</h6>
                        <span>{format(deliveryFee)}</span>
                      </li>
                    )}

                    <li>
                      <h6>{currentLanguage.total}</h6>
                      <span>
                        {format(
                          cartTotal.subtotal -
                            cartTotal.discountAmount +
                            deliveryFee
                        )}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {cartItems.length > 0 && (
          <div className="placeorder-cart">
            {orderType === "delivery" && (
              <div className="placeorder-location">
                <img src={`assets/user/img/location-icon.svg`} alt="Location" />
                <h6>{postCode}</h6>
                <a href="#" onClick={handleShowAddressModal}>
                  {postCode
                    ? currentLanguage.change_postcode
                    : currentLanguage.postCode}
                </a>
              </div>
            )}
            <div className="cart-area-footer-wrapper">
              <div
                onClick={handleCloseModal}
                className="cart-area-footer-arrow"
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
              </div>
              <div
                // onClick={() => {
                //   if (
                //     !isOpen ||
                //     (orderType === "delivery" && min_order_amount > 0)
                //   )
                //     return;
                //   handleCheckout();
                // }}

                onClick={() => {
                  if (orderType === "delivery" && min_order_amount > 0) return;
                  handleCheckout();
                }}
                // className={`cart-area-footer ${
                //   !isOpen || (min_order_amount > 0 && orderType === "delivery")
                //     ? "cart-area-footer-disabled"
                //     : "cart-area-footer-enabled"
                // }`}
                className={`cart-area-footer ${
                  min_order_amount > 0 && orderType === "delivery"
                    ? "cart-area-footer-disabled"
                    : "cart-area-footer-enabled"
                }`}
              >
                <div className="cart-totalprice">
                  <img src={`assets/user/img/blk-cart-icon.svg`} alt="Cart" />
                  <h5>
                    <span>
                      {cartTotal.itemCount} {currentLanguage.items_added}
                    </span>
                    {format(
                      cartTotal.subtotal -
                        cartTotal.discountAmount +
                        deliveryFee
                    )}
                  </h5>
                </div>

                <a
                  //   className={
                  //     !isOpen ||
                  //     (orderType === "delivery" && min_order_amount > 0)
                  //       ? "checkout-link-disabled"
                  //       : "checkout-link-enabled"
                  //   }
                  // >
                  //   {currentLanguage.view_cart}{" "}
                  //   <img
                  //     src={`assets/user/img/right-blk-arrow.svg`}
                  //     alt="Order"
                  //   />
                  // className={
                  //   !isOpen ||
                  //   (orderType === "delivery" && min_order_amount > 0)
                  //     ? "checkout-link-disabled"
                  //     : "checkout-link-enabled"
                  // }

                  className={
                    orderType === "delivery" && min_order_amount > 0
                      ? "checkout-link-disabled"
                      : "checkout-link-enabled"
                  }
                >
                  {isOpen
                    ? currentLanguage.view_cart
                    : currentLanguage.pre_order || "Pre-Order"}{" "}
                  <img
                    src={`assets/user/img/right-blk-arrow.svg`}
                    alt="Order"
                  />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddressModal
        show={showAddressModal}
        handleClose={() => {
          setShowCartButton(true);
          setShowAddressModal(false);
          showCartModal();
        }}
        onPostcodeSelect={handlePostcodeSelect}
        shouldManageCartButton={false}
      />

      <EditCartModel />

      <AddNoteModal
        orderNote={orderNote}
        show={showNoteModal}
        handleClose={handleNoteModalClose}
        onSave={handleNoteSave}
      />
    </>
  );
};

export default CartModal;
