import React, { useState, useEffect } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useLanguage } from "../../../contexts/LanguageContext";

const PayPalPayment = ({
  grandTotal,
  handlePlaceOrder,
  placing,
  orderSuccess,
}) => {
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
  const [currency, setCurrency] = useState(options.currency);
  const [paypalPaymentCompleted, setPaypalPaymentCompleted] = useState(false);
  const [paypalTransactionId, setPaypalTransactionId] = useState(null);
  const [paypalError, setPaypalError] = useState(null);
  const [paypalLoadingError, setPaypalLoadingError] = useState(false);
  const [paypalTimeout, setPaypalTimeout] = useState(false);

  const { translations: currentLanguage } = useLanguage();

  // Handle PayPal loading errors
  useEffect(() => {
    const handlePayPalError = (event) => {
      if (
        event.target &&
        event.target.src &&
        event.target.src.includes("paypal")
      ) {
        console.warn("PayPal script blocked by browser or ad blocker");
        setPaypalLoadingError(true);
      }
    };

    window.addEventListener("error", handlePayPalError);

    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      return originalFetch.apply(this, args).catch((error) => {
        if (args[0] && args[0].includes("paypal")) {
          console.warn("PayPal API request blocked");
          setPaypalLoadingError(true);
        }
        throw error;
      });
    };

    const timeout = setTimeout(() => {
      if (isPending) {
        console.warn("PayPal loading timeout");
        setPaypalTimeout(true);
      }
    }, 10000);

    return () => {
      window.removeEventListener("error", handlePayPalError);
      window.fetch = originalFetch;
      clearTimeout(timeout);
    };
  }, [isPending]);

  const onCreateOrder = (data, actions) => {
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
        const paidAmount = parseFloat(capture.amount.value);
        const expectedAmount = parseFloat(grandTotal.toFixed(2));

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

        if (details.status === "COMPLETED") {
          if (
            capture.status === "COMPLETED" ||
            (capture.status === "PENDING" &&
              capture.status_details?.reason ===
                "RECEIVING_PREFERENCE_MANDATES_MANUAL_ACTION")
          ) {
            setPaypalPaymentCompleted(true);
            setPaypalTransactionId(transactionId);
            setPaypalError(null);

            handlePlaceOrder({
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

  return (
    <div className="paypal-payment-form">
      {paypalLoadingError ? (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <strong> PayPal Blocked</strong>
          <p>
            It appears PayPal is being blocked by your browser or an ad blocker.
            Please disable your ad blocker or try a different browser to
            complete your payment.
          </p>
        </div>
      ) : paypalTimeout ? (
        <div className="alert alert-warning">
          <i className="fas fa-clock"></i>
          <strong> PayPal Loading Timeout</strong>
          <p>
            PayPal is taking longer than expected to load. Please check your
            internet connection and refresh the page.
          </p>
        </div>
      ) : (
        <>
          {paypalError && (
            <div className="alert alert-danger mb-3">
              <i className="fas fa-exclamation-circle"></i>
              <strong> {paypalError}</strong>
            </div>
          )}

          {paypalPaymentCompleted && (
            <div className="alert alert-success mb-3">
              <i className="fas fa-check-circle"></i>
              <strong> Payment Successful!</strong>
              <p>
                Transaction ID: <code>{paypalTransactionId}</code>
              </p>
            </div>
          )}

          {!paypalPaymentCompleted && !placing && !orderSuccess && (
            <div style={{ minHeight: "200px" }}>
              {isPending ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading PayPal...</span>
                  </div>
                  <p className="mt-2">Loading PayPal payment options...</p>
                </div>
              ) : (
                <PayPalButtons
                  style={{
                    layout: "vertical",
                    color: "gold",
                    shape: "rect",
                    label: "paypal",
                  }}
                  createOrder={onCreateOrder}
                  onApprove={onApproveOrder}
                  onError={onErrorOrder}
                  onCancel={onCancelOrder}
                  disabled={placing || orderSuccess}
                />
              )}
            </div>
          )}

          {(placing || orderSuccess) && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle"></i>
              <strong>
                {" "}
                {placing
                  ? "Processing your order..."
                  : "Order placed successfully!"}
              </strong>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PayPalPayment;
