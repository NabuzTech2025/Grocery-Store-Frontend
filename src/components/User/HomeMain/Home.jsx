import BannerSection from "./BannerSection";
import Footer from "./Footer";
import { CartProvider } from "../../../contexts/CartContext";
import "../../../../ui/css/HomeMain.css";
import Header from "../Header";
import { useState } from "react";
import MainCategory from "./MainCategory";
import HomePageProductSection from "./HomePageProductSection";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div
      className="home-page"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <CartProvider>
        {/* <div className="top-lables">
          FREE Delivery & 10% Discount on first Order!
        </div> */}
        <Header status={true} onSearch={setSearchTerm} />
        <main style={{ flex: 1 }}>
          <BannerSection />
          <MainCategory />
          <HomePageProductSection />
        </main>
        <Footer />
      </CartProvider>
    </div>
  );
};

export default Home;
