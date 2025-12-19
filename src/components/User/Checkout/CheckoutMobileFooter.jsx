import React from "react";
import { formatCurrencySync } from "../../../utils/helper/lang_translate";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useStoreDetails } from "../../../Hooks/useStoreDetails";
import { useCommonData } from "../../../contexts/CommonContext";
import { Spinner } from "react-bootstrap";

const CheckoutMobileFooter = ({
  subtotal,
  discountAmount,
  discountPercent,
  deliveryFee,
  grandTotal,
  orderType,
  placing,
  onPlaceOrder,
  orderSuccess,
  awaitingStripePayment,
  orderId,
}) => {
  const { language, translations: currentLanguage } = useLanguage();
  const format = (amount) => formatCurrencySync(amount, language);
  const { storeDetails, isLoading, error } = useStoreDetails();
  const { paymentMethod, setPaymentMethod } = useCommonData();

  const showButton =
    paymentMethod === "cash" || (paymentMethod === "stripe" && !orderId);

  return (
    <div
      className="position-fixed w-100 d-block d-lg-none"
      style={{
        bottom: "0",
        left: "0",
        zIndex: 1000,
        backgroundColor: "#fff",
        borderTop: "1px solid #eee",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Totals Section */}
      <div
        className="cehckout-area-total px-3 py-2"
        style={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <ul style={{ margin: 0, padding: 0 }}>
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

      {/* Place Order Button */}
      {showButton && (
        <div className="checkout-pay-button p-3">
          <button
            className="btn pay-button"
            onClick={onPlaceOrder}
            disabled={placing || orderSuccess || awaitingStripePayment}
            style={{
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {placing ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {currentLanguage.processing}...
              </>
            ) : paymentMethod === "stripe" && !orderId ? (
              "Create Order & Pay"
            ) : (
              currentLanguage.place_order || "Place Order"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutMobileFooter;
