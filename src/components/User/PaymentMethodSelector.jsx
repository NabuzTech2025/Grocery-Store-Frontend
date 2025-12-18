import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import PayPalPayment from "./PaymentMethod/PayPalPayment";
import StripePaymentModal from "./modals/StripePaymentModal";
import { useCommonData } from "../../contexts/CommonContext";

const PaymentMethodSelector = ({
  onPaymentMethodChange,
  handlePlaceOrder,
  grandTotal,
  placing,
  orderSuccess,
  orderId,
  awaitingStripePayment,
  clientSecret,
}) => {
  const {
    paymentMethod: contextPaymentMethod,
    setPaymentMethod: setContextPaymentMethod,
  } = useCommonData();
  const [paymentMethod, setPaymentMethod] = useState(contextPaymentMethod);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const { translations: currentLanguage } = useLanguage();

  const handleChange = (method) => {
    setPaymentMethod(method);
    setContextPaymentMethod(method);
    onPaymentMethodChange(method);
  };

  // Open Stripe modal when order is created and clientSecret is available
  React.useEffect(() => {
    if (
      paymentMethod === "stripe" &&
      orderId &&
      clientSecret &&
      awaitingStripePayment
    ) {
      setShowStripeModal(true);
    }
  }, [paymentMethod, orderId, clientSecret, awaitingStripePayment]);

  const handleCloseStripeModal = () => {
    if (!placing) {
      setShowStripeModal(false);
    }
  };

  return (
    <>
      <div className="payment-method-col">
        <h2>{currentLanguage.select_payment_method}</h2>

        {awaitingStripePayment && (
          <div className="alert alert-warning mb-3">
            <i className="fas fa-clock"></i>
            <strong> Payment Required</strong>
            <p style={{ margin: "0.5rem 0 0 0" }}>
              Your order has been created. Please complete your payment to
              confirm.
            </p>
          </div>
        )}

        <div className="select-payment-mode">
          {/* PayPal Payment Option - DISABLED */}
          {/* <div className="radio">
            <label>
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => handleChange("online")}
                disabled={awaitingStripePayment}
              />
              <span className="checkmark"></span>
              {currentLanguage.online_payment || "PayPal"}
            </label>

            {paymentMethod === "online" && (
              <div className="paypal-container mt-3">
                <PayPalPayment
                  grandTotal={grandTotal}
                  handlePlaceOrder={handlePlaceOrder}
                  placing={placing}
                  orderSuccess={orderSuccess}
                />
              </div>
            )}
          </div> */}

          {/* Stripe Payment Option */}
          <div className="radio">
            <label>
              <input
                type="radio"
                name="payment"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={() => handleChange("stripe")}
              />
              <span className="checkmark"></span>
              <div style={{ display: "inline-flex", flexDirection: "column" }}>
                <span>Stripe</span>
              </div>
            </label>
          </div>

          {/* Cash Payment Option */}
          <div className="radio mt-3">
            <label>
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => handleChange("cash")}
                disabled={awaitingStripePayment}
              />
              <span className="checkmark"></span>
              {currentLanguage.cash || "Cash on Delivery"}
            </label>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="payment-instructions mt-3">
          {paymentMethod === "online" && !awaitingStripePayment && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle"></i>{" "}
              {currentLanguage.online_payment_instructions ||
                "Complete payment through PayPal to confirm your order."}
            </div>
          )}
          {paymentMethod === "stripe" && !awaitingStripePayment && !orderId && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle"></i> Secure payment powered by
              Stripe. Supports 100+ payment methods worldwide.
            </div>
          )}
          {paymentMethod === "cash" && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle"></i>{" "}
              {currentLanguage.cash_payment_instructions ||
                "Pay with cash when your order is delivered."}
            </div>
          )}
        </div>
      </div>

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        show={showStripeModal}
        onClose={handleCloseStripeModal}
        clientSecret={clientSecret}
        grandTotal={grandTotal}
        handlePlaceOrder={handlePlaceOrder}
        placing={placing}
        orderSuccess={orderSuccess}
      />
    </>
  );
};

export default PaymentMethodSelector;
