import React from "react";
import { Edit2 } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { formatCurrencySync } from "../../../utils/helper/lang_translate";
import { useStoreDetails } from "../../../Hooks/useStoreDetails";
import { useCommonData } from "../../../contexts/CommonContext";
import { useCheckoutLogic } from "../../../Hooks/useCheckoutLogic";
import { Spinner } from "react-bootstrap";

const CheckoutOrderSummary = ({
  cartItems,
  orderType,
  postcode,
  addresses,
  subtotal,
  discountAmount,
  discountPercent,
  deliveryFee,
  grandTotal,
  orderNote,
  onAddNoteClick,
  isMobileViewport,
}) => {
  const { language, translations: currentLanguage } = useLanguage();
  const { storeDetails, isLoading, error } = useStoreDetails();
  const { paymentMethod, setPaymentMethod } = useCommonData();

  const format = (amount) => formatCurrencySync(amount, language);

  const getCartItemKey = (item) => {
    const toppingsKey =
      item.extras
        ?.map((extra) => `${extra.id}:${extra.quantity}`)
        .sort()
        .join("|") || "";
    return `${item.id}-${item.selectedVariant?.id || "base"}-${toppingsKey}`;
  };

  return (
    <div className="checkout-cart-area">
      {/* Cart Header */}
      <div className="checkout-cart-header">
        <span>
          <img
            src={`assets/user/img/${
              orderType === "pickup" || postcode === ""
                ? ""
                : "delivery-icon.svg"
            }`}
            alt="Delivery"
            style={{
              marginTop: "10px",
              display:
                orderType === "pickup" || postcode === "" ? "none" : "block",
            }}
          />
        </span>
        <h5>
          {orderType !== "pickup" && postcode !== "" && (
            <h3>
              {postcode}
              <em>
                {addresses?.line1} {addresses?.city} {addresses?.country}
              </em>
            </h3>
          )}
        </h5>
      </div>

      {/* Cart Items */}
      <div
        className="checkout-cart-item-area"
        style={{
          maxHeight: isMobileViewport ? "50vh" : "none",
          overflowY: isMobileViewport ? "auto" : "visible",
        }}
      >
        {/* Order Note */}
        <div onClick={onAddNoteClick} className="note-herder">
          <div className="note-header-wrapper">
            <Edit2 size={15} className="note-icon" />
            <h6 className="note-header">Note:-</h6>
          </div>
          <p className="note-content">{String(orderNote)}</p>
        </div>

        {/* Cart Header */}
        <ul className="cart-content-header">
          <li className="items-col">
            <h5>{currentLanguage.items || "Items"}</h5>
          </li>
          <li className="qty-col">
            <h5>{currentLanguage.qty || "Qty"}</h5>
          </li>
          <li className="price-col">
            <h5>{currentLanguage.price || "Price"}</h5>
          </li>
        </ul>

        {/* Cart Items List */}
        {cartItems.map((item) => {
          const toppingsTotal =
            item.extras?.reduce(
              (sum, t) => sum + (t.price || 0) * (t.quantity || 1),
              0
            ) || 0;
          const totalPrice =
            (item.displayPrice + toppingsTotal) * item.quantity;

          return (
            <div className="cart-items-area" key={getCartItemKey(item)}>
              <div className="cart-item-col">
                <div className="cart-item-text">
                  <h6>{item.name}</h6>
                  <span>
                    {item.quantity} × {item.selectedVariant?.name || "Standard"}{" "}
                    [{format(item.displayPrice)}]
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
                  <qty>{item.quantity}</qty>
                </div>
              </div>
              <div className="cart-items-price">
                <h4>{format(totalPrice)}</h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Totals */}
      <div
        className={`cehckout-area-total ${
          isMobileViewport ? "d-none" : "d-block"
        }`}
      >
        <ul>
          <li>
            <h6>{currentLanguage.subtotal}</h6>
            <span>{format(subtotal)}</span>
          </li>
          {discountAmount > 0 && (
            <li>
              <h6>
                {currentLanguage.discount}{" "}
                <label>
                  {currentLanguage.saved} {discountPercent}%
                </label>
              </h6>
              <span>{format(discountAmount)}</span>
            </li>
          )}
          {deliveryFee > 0 && orderType === "delivery" && (
            <li>
              <h6>{currentLanguage.delivery_charges}</h6>
              <span>{format(deliveryFee)}</span>
            </li>
          )}
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            paymentMethod === "stripe" && (
              <li>
                <h6>{currentLanguage.Servicefee}</h6>
                <span>{format(storeDetails.stripe_service_fee)}</span>
              </li>
            )
          )}
          <li>
            <h6>{currentLanguage.total}</h6>
            <span>{format(grandTotal)}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;
