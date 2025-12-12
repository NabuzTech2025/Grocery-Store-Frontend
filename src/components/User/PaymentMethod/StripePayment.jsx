import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useLanguage } from "../../../contexts/LanguageContext";
const StripePayment = ({
  grandTotal,
  handlePlaceOrder,
  placing,
  orderSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const [stripeSuccess, setStripeSuccess] = useState(false);
  const [stripeTransactionId, setStripeTransactionId] = useState(null);
  const [paymentElementReady, setPaymentElementReady] = useState(false);
  const { translations: currentLanguage } = useLanguage();

  const handlePaymentSuccess = (paymentIntent) => {
    setStripeSuccess(true);
    setStripeTransactionId(paymentIntent.id);
    setStripeError(null);
    setStripeProcessing(false);

    handlePlaceOrder({
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  };

  const handleStripePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setStripeError("Stripe is not ready. Please wait or refresh the page.");
      return;
    }

    setStripeProcessing(true);
    setStripeError(null);

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setStripeError(submitError.message);
        setStripeProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/checkout",
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Stripe payment error:", error);
        setStripeError(error.message || "Payment failed. Please try again.");
        setStripeProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        handlePaymentSuccess(paymentIntent);
      } else if (paymentIntent) {
        if (paymentIntent.status === "processing") {
          setStripeError("Payment is processing. Please wait...");
        } else {
          setStripeError(`Payment status: ${paymentIntent.status}`);
        }
        setStripeProcessing(false);
      }
    } catch (err) {
      console.error("Stripe payment exception:", err);
      setStripeError("An unexpected error occurred. Please try again.");
      setStripeProcessing(false);
    }
  };

  return (
    <>
      <form onSubmit={handleStripePayment}>
        <div
          className="payment-element-wrapper"
          style={{ marginBottom: "20px" }}
        >
          <PaymentElement
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
              paymentMethodOrder: ["card", "applePay", "googlePay"],
              wallets: {
                applePay: "auto",
                googlePay: "auto",
              },
              fields: {
                billingDetails: {
                  address: {
                    country: "auto",
                  },
                },
              },
            }}
            onReady={() => setPaymentElementReady(true)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 mt-3"
          disabled={
            !stripe ||
            !paymentElementReady ||
            stripeProcessing ||
            stripeSuccess ||
            placing ||
            orderSuccess
          }
          style={{
            padding: "14px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "8px",
          }}
        >
          {stripeProcessing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Processing Payment...
            </>
          ) : stripeSuccess ? (
            <>
              <i className="fas fa-check-circle me-2"></i>
              Payment Completed
            </>
          ) : (
            <>
              <i className="fas fa-lock me-2"></i>
              Pay €{grandTotal.toFixed(2)}
            </>
          )}
        </button>
      </form>

      {stripeSuccess && (
        <div className="alert alert-success mt-3">
          <i className="fas fa-check-circle"></i> Payment completed
          successfully!
          <br />
          <small>Transaction ID: {stripeTransactionId}</small>
        </div>
      )}

      {stripeError && (
        <div className="alert alert-danger mt-3">
          <i className="fas fa-exclamation-triangle"></i> {stripeError}
        </div>
      )}

      <div className="stripe-info mt-3 text-center">
        <small className="text-muted">
          <i className="fas fa-shield-alt"></i> Secured by Stripe • PCI DSS
          Compliant
          <br />
          <span style={{ fontSize: "0.9em" }}>
            Your payment information is encrypted and secure
          </span>
        </small>
      </div>
    </>
  );
};

export default StripePayment;
