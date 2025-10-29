import React, { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import shopTrolley from "../../../public/assets/user/img/shopTrolley.png";
import { useAuth } from "@/auth/AuthProvider";
import { formatCurrencySync } from "../../utils/helper/lang_translate";
import AddressModal from "./modals/AddressModal";
import { useLanguage } from "../../contexts/LanguageContext";
import { useStoreStatus } from "../../contexts/StoreStatusContext";

const CartButton = () => {
  const { itemCount, cartTotal, showcartButton } = useCart();
  const { isOpen, setPostCode, orderType, hoursDisplay } = useStoreStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [pendingCartOpen, setPendingCartOpen] = useState(false);
  const { logout } = useAuth();
  const { language, translations: currentLanguage } = useLanguage();

  useEffect(() => {
    const modalElement = document.getElementById("cartModal");
    if (!modalElement) return;

    const handleShow = () => setIsModalOpen(true);
    const handleHide = () => setIsModalOpen(false);

    modalElement.addEventListener("show.bs.modal", handleShow);
    modalElement.addEventListener("hidden.bs.modal", handleHide);

    return () => {
      modalElement.removeEventListener("show.bs.modal", handleShow);
      modalElement.removeEventListener("hidden.bs.modal", handleHide);
    };
  }, []);

  const handleForceLogout = () => {
    logout();
  };

  const openCartModal = () => {
    const modalElement = document.getElementById("cartModal");
    if (modalElement) {
      const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  };

  const handlePostcodeSelect = (data) => {
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee);
    setPostCode(data.postcode); // Update context to sync with Header

    // Close address modal
    setShowAddressModal(false);

    // Open cart modal after address is selected
    if (pendingCartOpen) {
      setPendingCartOpen(false);
      // Use setTimeout to ensure address modal is fully closed before opening cart modal
      setTimeout(() => {
        openCartModal();
      }, 100);
    }
  };

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
    setPendingCartOpen(false); // Reset pending state if modal is closed without selection
  };

  const handleShowCart = (e) => {
    e.preventDefault();

    // Check if delivery postcode is needed
    if (
      !localStorage.getItem("delivery_postcode") &&
      orderType === "delivery"
    ) {
      // Set flag to open cart modal after address selection
      setPendingCartOpen(true);
      setShowAddressModal(true);
      return; // Don't open cart modal yet
    }

    // If postcode exists or it's pickup, open cart modal directly
    openCartModal();
  };

  if (isModalOpen || itemCount === 0) return null;

  // Get delivery fee from localStorage or use default
  const deliveryFee = parseFloat(localStorage.getItem("delivery_fee")) || 0;
  const finalDeliveryFee = orderType === "pickup" ? 0 : deliveryFee;

  // Calculate grand total using cartTotal from context
  const grandTotal =
    cartTotal.subtotal - cartTotal.discountAmount + finalDeliveryFee;

  return (
    <>
      <div
        onClick={handleShowCart}
        id="caetButton"
        style={{
          // cursor: isOpen ? "pointer" :  "not-allowed",
          cursor: "pointer",
        }}
        className={`viewcart-area ${
          itemCount > 0 && showcartButton ? "viewcart-area-active" : ""
        }`}
      >
        <>
          <div className="cart-totalprice">
            <img
              style={{
                width: "40px",
                height: "40px",
              }}
              src={shopTrolley}
              alt="Cart"
            />
            <h5>
              <span>
                {itemCount}{" "}
                {itemCount === 1 ? currentLanguage.item : currentLanguage.items}
              </span>
              {formatCurrencySync(grandTotal, language)}
            </h5>
          </div>

          <a
            href="#"
            style={{
              pointerEvents: "auto",
              opacity: 1,
              cursor: "pointer",
            }}
          >
            {/* {currentLanguage.view_cart}{" "} */}
            {isOpen
              ? currentLanguage.view_cart
              : currentLanguage.pre_order || "Vorbestellung"}{" "}
            <img src={`assets/user/img/right-wht-arrow.svg`} alt="Arrow" />
          </a>
        </>
      </div>

      <AddressModal
        show={showAddressModal}
        handleClose={handleAddressModalClose}
        onPostcodeSelect={handlePostcodeSelect}
      />
    </>
  );
};

export default CartButton;
