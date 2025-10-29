import React, { useEffect, useState } from "react";
import Header from "../../components/User/Header";
import Hero from "@/components/User/Hero";
import StoreTitle from "@/components/User/StoreTitle";
import ProductsArea from "../../components/User/ProductArea/ProductsArea";
import Footer from "@/components/User/Footer";
import CartButton from "../../components/User/CartButton";
import AddressModal from "@/components/User/modals/AddressModal";
import VariantModal from "@/components/User/modals/VariantModal";
import CartModal from "../../components/User/modals/CartModal";
import LoginModal from "@/components/User/modals/LoginModal";
import ScrollToTopButton from "@/components/User/ScrollToTopButton";
import { CartProvider } from "@/contexts/CartContext";
import { StoreStatusProvider } from "@/contexts/StoreStatusContext";
import { useLocation } from "react-router-dom";

const Restaurant = () => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const selectedCategoryId = location.state?.selectedCategoryId; // 👈 Access here

  console.log("Selected Category ID:", selectedCategoryId);
  return (
    <div
      className="restaurant-page"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <StoreStatusProvider>
        <CartProvider>
          {/* Main content area that will grow and allow scrolling */}
          <main style={{ flex: 1 }}>
            <ProductsArea
              onAddClick={() => setShowVariantModal(true)}
              searchTerm={searchTerm}
              selectedCategory_id={selectedCategoryId}
            />
          </main>

          <Footer />
          <CartButton />

          {/* Modals */}
          <AddressModal
            show={showAddressModal}
            handleClose={() => setShowAddressModal(false)}
          />
          <CartModal />
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
