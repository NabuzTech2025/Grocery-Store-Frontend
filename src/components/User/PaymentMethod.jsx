import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

const PaymentMethodSelector = ({ onPaymentMethodChange }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  const handleChange = (method) => {
    setPaymentMethod(method);
    onPaymentMethodChange(method); // Notify parent component
  };

  return (
    <div className="payment-method-col">
      <h2>{currentLanguage.select_payment_method}</h2>
      <div className="select-payment-mode">
        <div className="radio">
          <label>
            {currentLanguage.online_payment}
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => handleChange("online")}
            />
            <span className="checkmark"></span>
          </label>
        </div>
        <div className="select-payment-buttons">
          <a href="#">
            <img
              className="img-fluid"
              src="/assets/user/img/paypal-btn.png"
              alt="PayPal"
            />
          </a>
          <a href="#">
            <img
              className="img-fluid"
              src="/assets/user/img/card-payment.png"
              alt="Card"
            />
          </a>
        </div>
        <div className="radio mt-2">
          <label>
            {currentLanguage.cash}
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={() => handleChange("cash")}
            />
            <span className="checkmark"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
