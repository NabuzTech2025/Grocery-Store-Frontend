import React, { useEffect, useState } from "react";
import Header from "../../components/User/Header";
import Hero from "@/components/User/Hero";
import StoreTitle from "@/components/User/StoreTitle";
import ProductsArea from "../../components/User/ProductArea/ProductsArea";
import Footer from "@/components/User/Footer";
import CartButton from "../../components/User/CartButton";
import AddressModal from "@/components/User/modals/AddressModal";
import VariantModal from "@/components/User/modals/VariantModal";
import CartModal from "@/components/User/modals/CartModal";
import LoginModal from "@/components/User/modals/LoginModal";
import ScrollToTopButton from "@/components/User/ScrollToTopButton";
import { CartProvider } from "@/contexts/CartContext";
import { StoreStatusProvider } from "@/contexts/StoreStatusContext";

const Restaurant = () => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div
      className="restaurant-page"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <StoreStatusProvider>
        <CartProvider>
          <Header status={true} onSearch={setSearchTerm} />
          <Hero />

          {/* Main content area that will grow and allow scrolling */}
          <main style={{ flex: 1 }}>
            <div className="sticky top-0 z-10 bg-white">
              <StoreTitle />
            </div>

            <ProductsArea
              onAddClick={() => setShowVariantModal(true)}
              searchTerm={searchTerm}
            />
          </main>

          <Footer />
          <CartButton onViewCartClick={() => setShowCartModal(true)} />

          {/* Modals */}
          <AddressModal
            show={showAddressModal}
            handleClose={() => setShowAddressModal(false)}
          />
          <CartModal
            show={showCartModal}
            handleClose={() => setShowCartModal(false)}
          />
          <LoginModal
            show={showLoginModal}
            handleClose={() => setShowLoginModal(false)}
          />
          <VariantModal />
          <ScrollToTopButton />
        </CartProvider>
      </StoreStatusProvider>
    </div>
  );
};

export default Restaurant;
