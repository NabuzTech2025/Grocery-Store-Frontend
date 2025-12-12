import React, { useState } from "react";
import Header from "@/components/User/Header";
import Footer from "@/components/User/Footer";
import AddressModal from "@/components/User/modals/AddressModal";
import AddNoteModal from "@/components/User/modals/AddNote";
import TimeSelector from "../../components/User/TimeSelector";
import PaymentMethodSelector from "../../components/User/PaymentMethodSelector";
import OrderSuccess from "../../components/User/OrderSuccess";
import { useViewport } from "../../contexts/ViewportContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCheckoutLogic } from "../../Hooks/useCheckoutLogic";
import CheckoutOrderSummary from "../../components/User/Checkout/CheckoutOrderSummary";
import CheckoutMobileFooter from "../../components/User/Checkout/CheckoutMobileFooter";

const CheckoutPage = () => {
  const { isMobileViewport } = useViewport();
  const { translations: currentLanguage } = useLanguage();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedTimeErrorShow, setSelectedTimeErrorShow] = useState(false);

  // Use custom hook for all checkout logic
  const {
    orderType,
    postcode,
    deliveryFee,
    discountPercent,
    discountId,
    paymentMethod,
    placing,
    orderSuccess,
    orderId,
    addresses,
    cartItems,
    selectedTime,
    isRedirecting,
    clientSecret,
    awaitingStripePayment,
    orderNote,
    subtotal,
    discountAmount,
    grandTotal,
    setPaymentMethod,
    setSelectedTime,
    setOrderNote,
    handlePlaceOrder,
    handlePostcodeSelect,
  } = useCheckoutLogic();

  const handleAddNoteClick = () => {
    setShowNoteModal(true);
  };

  const handleNoteModalClose = () => {
    setShowNoteModal(false);
  };

  const handleNoteSave = (note) => {
    setOrderNote(note);
    setShowNoteModal(false);
  };

  const handleSelectOrderType = (type) => {
    // Handle order type change if needed
  };

  return (
    <>
      <Header status={false} />

      <section
        className="checkout-area"
        style={{ paddingBottom: isMobileViewport ? "100px" : "0" }}
      >
        <div className="container" style={{ maxWidth: "1170px" }}>
          {orderSuccess || isRedirecting ? (
            <OrderSuccess orderId={orderId} />
          ) : (
            <div className="row">
              {/* Left Column - Time & Payment Selection */}
              <div className="col-lg-6 col-sm-6 col-12">
                <TimeSelector
                  selectedTimeErrorShow={selectedTimeErrorShow}
                  setSelectedTimeErrorShow={setSelectedTimeErrorShow}
                  onSelectType={handleSelectOrderType}
                  onSelectTime={setSelectedTime}
                  deliveryTime={postcode}
                />

                <PaymentMethodSelector
                  onPaymentMethodChange={setPaymentMethod}
                  handlePlaceOrder={handlePlaceOrder}
                  grandTotal={grandTotal}
                  placing={placing}
                  orderSuccess={orderSuccess}
                  orderId={orderId}
                  awaitingStripePayment={awaitingStripePayment}
                  clientSecret={clientSecret}
                />
              </div>

              {/* Spacer */}
              <div className="col-lg-2 d-lg-block d-sm-none"></div>

              {/* Right Column - Order Summary */}
              <div className="col-lg-4 col-sm-6 col-12">
                <CheckoutOrderSummary
                  cartItems={cartItems}
                  orderType={orderType}
                  postcode={postcode}
                  addresses={addresses}
                  subtotal={subtotal}
                  discountAmount={discountAmount}
                  discountPercent={discountPercent}
                  deliveryFee={deliveryFee}
                  grandTotal={grandTotal}
                  orderNote={orderNote}
                  onAddNoteClick={handleAddNoteClick}
                  isMobileViewport={isMobileViewport}
                />
                {(paymentMethod === "cash" ||
                  (paymentMethod === "stripe" && !orderId)) && (
                  <div
                    className={`checkout-pay-button mt-3 ${
                      isMobileViewport ? "d-none" : "d-block"
                    }`}
                  >
                    <button
                      className="btn pay-button"
                      onClick={() => handlePlaceOrder()}
                      disabled={
                        placing || orderSuccess || awaitingStripePayment
                      }
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
                      ) : (
                        currentLanguage.place_order || "Place Order"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Floating Footer with Totals & Button */}
      {isMobileViewport && !orderSuccess && (
        <CheckoutMobileFooter
          subtotal={subtotal}
          discountAmount={discountAmount}
          discountPercent={discountPercent}
          deliveryFee={deliveryFee}
          grandTotal={grandTotal}
          orderType={orderType}
          paymentMethod={paymentMethod}
          orderId={orderId}
          placing={placing}
          orderSuccess={orderSuccess}
          awaitingStripePayment={awaitingStripePayment}
          onPlaceOrder={() => handlePlaceOrder()}
        />
      )}

      <Footer />

      {/* Modals */}
      <AddressModal
        show={showAddressModal}
        handleClose={() => setShowAddressModal(false)}
        onPostcodeSelect={handlePostcodeSelect}
      />

      <AddNoteModal
        orderNote={orderNote}
        show={showNoteModal}
        handleClose={handleNoteModalClose}
        onSave={handleNoteSave}
      />
    </>
  );
};

export default CheckoutPage;
