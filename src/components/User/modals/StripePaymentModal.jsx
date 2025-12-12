import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { X } from "lucide-react";
import StripePayment from "../PaymentMethod/StripePayment";

const stripePromise = loadStripe(
  "pk_test_51SQmeLRvxHgksgYLk9IoLKNNXtGYbXotycDdZDNr7c0MIzq6JZoeVZlt9zwzSW1KnOP3eAbcJnleNVlwHZRrxpxL00nLqgZdAI"
);

const StripePaymentModal = ({
  show,
  onClose,
  clientSecret,
  grandTotal,
  handlePlaceOrder,
  placing,
  orderSuccess,
}) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1040,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="modal fade show"
        style={{
          display: "block",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1050,
          overflow: "auto",
        }}
        tabIndex="-1"
        role="dialog"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{
            maxWidth: "700px",
          }}
          role="document"
        >
          <div
            className="modal-content"
            style={{
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
              border: "none",
            }}
          >
            {/* Modal Header */}
            <div
              className="modal-header"
              style={{
                borderBottom: "1px solid #e9ecef",
                padding: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h5
                  className="modal-title"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    marginLeft: "1rem",
                  }}
                >
                  Complete Your Payment
                </h5>
                <p
                  style={{
                    color: "#6c757d",
                    fontSize: "0.95rem",
                    marginLeft: "1.2rem",
                  }}
                >
                  Total Amount: <strong>€{grandTotal.toFixed(2)}</strong>
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                }}
                disabled={placing}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {!clientSecret ? (
                <div className="text-center" style={{ padding: "2rem 0" }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading payment options...</span>
                  </div>
                  <p className="mt-3" style={{ color: "#6c757d" }}>
                    Initializing secure payment...
                  </p>
                </div>
              ) : (
                <>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePayment
                      grandTotal={grandTotal}
                      handlePlaceOrder={handlePlaceOrder}
                      placing={placing}
                      orderSuccess={orderSuccess}
                    />
                  </Elements>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="modal-footer"
              style={{
                borderTop: "1px solid #e9ecef",
                padding: "1rem 1.5rem",
                backgroundColor: "#f8f9fa",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  fontSize: "0.85rem",
                  color: "#6c757d",
                }}
              >
                <i
                  className="fas fa-lock"
                  style={{ marginRight: "0.5rem" }}
                ></i>
                Powered by Stripe • Cards, Wallets, Bank Transfers & More
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StripePaymentModal;
