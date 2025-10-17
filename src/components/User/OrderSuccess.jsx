import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { useCart } from "@contexts/CartContext";
import { payload_url } from "../../utils/common_urls";
import { useLanguage } from "../../contexts/LanguageContext";

const OrderSuccess = ({ orderId }) => {
  const [status, setStatus] = useState("pending");
  const { clearCart } = useCart();
  const [seconds, setSeconds] = useState(30);
  const timerRef = useRef(null);
  const countdownStarted = useRef(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const navigate = useNavigate();
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  // Countdown timer
  const startCountdown = () => {
    if (countdownStarted.current) return; // Prevent multiple intervals
    countdownStarted.current = true;

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("order_placed");
          clearInterval(timerRef.current);
          clearCart();
          // i don't want to use this window.location.reload() but. i need to use for some reason
          window.location.replace(payload_url);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const backToHome = () => {
    localStorage.removeItem("order_placed");
    clearCart();
    // i don't want to use this window.location.reload() but. i need to use for some reason
    window.location.replace(payload_url);
  };

  // Socket.IO connection and event listeners
  useEffect(() => {
    if (!orderId) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      path: "/ws-sio/socket.io",
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to Socket.IO");
      newSocket.emit("join_store", { store_id: import.meta.env.VITE_STORE_ID });
    });

    newSocket.on("joined_store", (data) => {
      console.log(`✅ Joined room: ${data.room}`);
    });

    newSocket.on("order_updated", (data) => {
      console.log("Order update received: =====>", data);
      if (data.order_id === parseInt(orderId)) {
        if (data.approval_status === 2) {
          setStatus("accepted");
          setOrderNumber(data.order_number);
          startCountdown();
        } else if (data.approval_status === 3) {
          setStatus("rejected");
          startCountdown();
        }
      }
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (!orderId) return null;

  return (
    <section className="checkout-area py-5">
      <div className="container text-center">
        <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: 500 }}>
          {status === "pending" ? (
            <div className="d-flex flex-column align-items-center justify-content-center">
              <div
                className="spinner-border text-primary"
                style={{
                  width: "3rem",
                  height: "3rem",
                }}
                role="status"
              >
                <span className="visually-hidden">
                  {currentLanguage.loading}...
                </span>
              </div>
              <h3 className="mt-3 text-center">
                {currentLanguage.waiting_confirmation ||
                  "Waiting for Restaurant Confirmation"}
              </h3>
              <p className="text-center">
                {currentLanguage.order_processing || "Your order"} #{orderId}{" "}
                {currentLanguage.is_being_processed || "is being processed..."}
              </p>
            </div>
          ) : status === "accepted" ? (
            <>
              <div style={{ fontSize: 48, color: "#2ecc71" }}>😊</div>
              <h3 className="mt-3">
                {" "}
                {currentLanguage.order_accepted ||
                  "Your Order has been Accepted"}
              </h3>
              <p className="mb-1">
                {currentLanguage.thanks_order || "Thanks for your order!"}
              </p>
              <p
                style={{
                  marginBottom: 0,
                }}
              >
                <strong>{currentLanguage.order_id || "Order ID"}:</strong> #
                {orderId}
              </p>
              <p>
                <strong>{currentLanguage.order_Number || "Order ID"}:</strong> #
                {orderNumber || "---"}
              </p>

              <p>
                {currentLanguage.back_to || "Back to"}{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    backToHome();
                  }}
                >
                  {currentLanguage.home || "Home"}
                </a>{" "}
                -<span style={{ color: "red" }}> {seconds}s</span>
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, color: "#e74c3c" }}>😞</div>
              <h3 className="mt-3">
                {currentLanguage.order_not_accepted || "Order Not Accepted"}
              </h3>
              <p className="mb-1">
                {currentLanguage.order_rejected_message ||
                  `Sorry, the restaurant couldn't accept your order`}{" "}
                #{orderId}
              </p>
              <p>
                {currentLanguage.back_to || "Back to"}{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    backToHome();
                  }}
                >
                  {currentLanguage.home || "Home"}
                </a>{" "}
                -<span style={{ color: "red" }}> {seconds}s</span>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderSuccess;
