import React from "react";
import Header from "../../components/User/Header";
import { useStoreStatus } from "../../contexts/StoreStatusContext";
import { CartProvider } from "../../contexts/CartContext";
import CartButton from "../../components/User/CartButton";
import CartModal from "../../components/User/modals/CartModal";
import SearchResults from "../../components/User/Searchproduct/SearchResults";

const SearchProductPage = () => {
  const { store } = useStoreStatus();

  return (
    <div className="search-product-page">
      {/* Header */}
      <CartProvider>
        <Header status={store?.status} />

        {/* Search Results */}
        <SearchResults />
        <CartButton />
        <CartModal />
      </CartProvider>
    </div>
  );
};

export default SearchProductPage;
