import React from "react";
import Header from "./Header";
import Banner from "./Banner";
import FeaturedProducts from "./FeaturedProducts";
import Footer from "./Footer";
import { CartProvider } from "../../../contexts/CartContext";
import "../../../../ui/css/HomeMain.css";

const Home = () => {
  return (
    <div className="home-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <CartProvider>
        <Header />
        <main style={{ flex: 1 }}>
          <Banner />
          <FeaturedProducts />
        </main>
        <Footer />
      </CartProvider>
    </div>
  );
};

export default Home;
