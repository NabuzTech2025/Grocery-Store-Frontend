import { useCart } from "../../../contexts/CartContext";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useStoreStatus } from "../../../contexts/StoreStatusContext";

const OrderTypeButtons = ({ overrideClassName = "" }) => {
  const { orderType, setOrderType, discounts, discountLoading } =
    useStoreStatus();
  const { translations: currentLanguage } = useLanguage();
  const { setShowPostCode } = useCart();

  const handleOrderTypeChange = (type) => {
    // Store in localStorage
    localStorage.setItem("order_type", type);

    // Toggle postcode visibility
    setShowPostCode((prev) => !prev);

    // Call parent callback
    if (setOrderType) {
      setOrderType(type);
    }
  };

  const buttonStyle = {
    transition: "all 0.2s ease-in-out",
    transform: "scale(1)",
  };

  const handleMouseEnter = (e) => {
    e.target.style.transform = "scale(1.02)";
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = "scale(1)";
  };

  return (
    <div className={`order-type-button d-inline-flex ${overrideClassName}`}>
      <button
        type="button"
        className={`select-type delivery ${
          orderType === "delivery" ? "active" : ""
        }`}
        onClick={() => handleOrderTypeChange("delivery")}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {discountLoading
          ? `${currentLanguage.loading}...`
          : discounts.delivery.value > 0
          ? `${discounts.delivery.value}% ${currentLanguage.delivery}`
          : currentLanguage.delivery}
      </button>

      <button
        type="button"
        className={`select-type pickup ${
          orderType === "pickup" ? "active" : ""
        }`}
        onClick={() => handleOrderTypeChange("delivery")}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {discountLoading
          ? "Loading..."
          : discounts.pickup.value > 0
          ? `${discounts.pickup.value}% ${currentLanguage.pickup}`
          : currentLanguage.pickup}
      </button>
    </div>
  );
};

export default OrderTypeButtons;
