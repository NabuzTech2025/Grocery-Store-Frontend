import React, { useState, useEffect } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useLanguage } from "../../contexts/LanguageContext";

const PaymentMethodSelector = ({
  onPaymentMethodChange,
  handlePlaceOrder,
  grandTotal,
  placing,
  orderSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
  const [currency, setCurrency] = useState(options.currency);
  const [paypalPaymentCompleted, setPaypalPaymentCompleted] = useState(false);
  const [paypalTransactionId, setPaypalTransactionId] = useState(null);
  const [paypalError, setPaypalError] = useState(null);
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  const handleChange = (method) => {
    setPaymentMethod(method);
    onPaymentMethodChange(method);

    // Reset PayPal states when switching payment methods
    if (method !== "online") {
      setPaypalPaymentCompleted(false);
      setPaypalTransactionId(null);
      setPaypalError(null);
    }
  };

  const onCreateOrder = (data, actions) => {
    // Convert total to the format PayPal expects
    const paypalAmount = grandTotal.toFixed(2);

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: paypalAmount,
            currency_code: currency || "USD",
          },
          description: "Order Payment",
        },
      ],
    });
  };

  const onApproveOrder = (data, actions) => {
    return actions.order
      .capture()
      .then((details) => {
        console.log("PayPal Transaction Details: ===>", details);

        const capture = details?.purchase_units?.[0]?.payments?.captures?.[0];
        if (!capture) {
          setPaypalError("No payment capture found. Please try again.");
          return;
        }

        const transactionId = details.id;
        const captureId = capture.id;
        const payerName = details?.payer?.name?.given_name || "Customer";
        const paidAmount = parseFloat(capture.amount.value);
        const expectedAmount = parseFloat(grandTotal.toFixed(2));

        // Handle declined / failed instruments
        if (capture.status === "DECLINED" || capture.status === "FAILED") {
          const reason = capture.status_details?.reason || "Unknown reason";

          if (reason === "INSTRUMENT_DECLINED") {
            return actions.restart().catch(() => {
              setPaypalError(currentLanguage.paypal_declined);
            });
          }

          if (reason === "INSUFFICIENT_FUNDS") {
            setPaypalError(currentLanguage.paypal_insufficient_funds);
            return;
          }

          if (reason === "CARD_EXPIRED") {
            setPaypalError(currentLanguage.paypal_card_expired);
            return;
          }

          setPaypalError(`${currentLanguage.paypal_failed}: ${reason}`);
          return;
        }

        if (
          capture.status === "PENDING" &&
          capture.status_details?.reason !==
            "RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION"
        ) {
          setPaypalError(currentLanguage.paypal_pending);

          return;
        }
        if (paidAmount !== expectedAmount) {
          setPaypalError(
            `Payment amount mismatch. Expected ${expectedAmount} but received ${paidAmount}. Transaction cancelled.`
          );
          return;
        }
        // Validate the payment
        if (details.status === "COMPLETED") {
          // Check if capture is COMPLETED, PENDING, or other successful states
          // PENDING with RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION means payment needs manual approval
          if (
            capture.status === "COMPLETED" ||
            (capture.status === "PENDING" &&
              capture.status_details?.reason ===
                "RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION")
          ) {
            // Set payment as completed
            setPaypalPaymentCompleted(true);
            setPaypalTransactionId(transactionId);
            setPaypalError(null);

            // Automatically trigger order placement after successful payment
            handlePlaceOrderWithPayPal({
              transactionId,
              captureId,
              payerDetails: details.payer,
            });
          } else {
            setPaypalError(
              `${currentLanguage.paypal_capture_status}: ${capture.status}`
            );
            setPaypalPaymentCompleted(false);
          }
        } else {
          setPaypalError(currentLanguage.paypal_not_completed);
          setPaypalPaymentCompleted(false);
        }
      })
      .catch((error) => {
        console.error("PayPal payment error:", error);
        setPaypalError(currentLanguage.paypal_failed);
        setPaypalPaymentCompleted(false);
      });
  };

  const onErrorOrder = (err) => {
    console.error("PayPal Error:", err);
    setPaypalError(currentLanguage.paypal_error);
    setPaypalPaymentCompleted(false);
  };

  const onCancelOrder = (data) => {
    console.log("PayPal payment cancelled:", data);
    setPaypalError(currentLanguage.paypal_cancelled);
    setPaypalPaymentCompleted(false);
  };

  // Modified handlePlaceOrder to include PayPal transaction details
  const handlePlaceOrderWithPayPal = (paypalDetails = null) => {
    if (
      paymentMethod === "online" &&
      !paypalPaymentCompleted &&
      !paypalDetails
    ) {
      setPaypalError(currentLanguage.paypal_complete_first);
      return;
    }

    // Call the parent's handlePlaceOrder with PayPal details
    handlePlaceOrder(paypalDetails);
  };

  // Handle cash payment order placement
  const handleCashOrderPlacement = () => {
    if (paymentMethod === "cash") {
      handlePlaceOrder();
    }
  };

  return (
    <div className="payment-method-col">
      <h2>{currentLanguage.select_payment_method}</h2>
      <div className="select-payment-mode">
        {/* PayPal Payment Option */}
        <div className="radio">
          <label>
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => handleChange("online")}
            />
            <span className="checkmark"></span>
            {currentLanguage.online_payment}
          </label>

          {paymentMethod === "online" && (
            <div className="paypal-container mt-3">
              {isPending ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">
                      {currentLanguage.loading} PayPal...
                    </span>
                  </div>
                  <p className="mt-2">{currentLanguage.loading} PayPal...</p>
                </div>
              ) : (
                <>
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "gold",
                      shape: "rect",
                      label: "paypal",
                    }}
                    createOrder={(data, actions) =>
                      onCreateOrder(data, actions)
                    }
                    onApprove={(data, actions) => onApproveOrder(data, actions)}
                    onError={onErrorOrder}
                    onCancel={onCancelOrder}
                    disabled={placing || orderSuccess}
                  />
                </>
              )}

              {/* PayPal Status Messages */}
              {paypalPaymentCompleted && (
                <div className="alert alert-success mt-2">
                  <i className="fas fa-check-circle"></i>{" "}
                  {currentLanguage.payment_completed_message}
                  <br />
                  <small>
                    {currentLanguage.transaction_id}: {paypalTransactionId}
                  </small>
                </div>
              )}

              {paypalError && (
                <div className="alert alert-danger mt-2">
                  <i className="fas fa-exclamation-triangle"></i> {paypalError}
                </div>
              )}
            </div>
          )}
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
            />
            <span className="checkmark"></span>
            {currentLanguage.cash}
          </label>
        </div>
      </div>

      {/* General Instructions */}
      <div className="payment-instructions mt-3">
        {paymentMethod === "online" && (
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i>{" "}
            {currentLanguage.online_payment_instructions}
          </div>
        )}
        {paymentMethod === "cash" && (
          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i>{" "}
            {currentLanguage.cash_payment_instructions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
