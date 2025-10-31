import React, { useState, useMemo } from "react";
import "../../../../ui/css/HomeMain.css";
import shopTrolley from "../../../../public/assets/user/img/shopTrolley.png";
import { useStoreStatus } from "../../../contexts/StoreStatusContext.jsx";
import ProductDetailModal from "../modals/ProductDetailModel.jsx";
import { useCategoriesWithProducts } from "../../../Hooks/useProductData.js.js";
import ProductCard from "../ProductArea/ProductCard.jsx";

function HomePageProductSection() {
  const { serverTime } = useStoreStatus();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Use custom hook to fetch categories and products
  const { categories, allProducts, isLoading, error } =
    useCategoriesWithProducts(serverTime);

  // Transform data using useMemo
  const categoryProducts = useMemo(() => {
    if (categories.length === 0 || allProducts.length === 0) return [];

    return allProducts
      .filter((categoryData) => categoryData.products.length > 0)
      .map((categoryData) => {
        const category = categories.find(
          (cat) => cat.id === categoryData.categoryId
        );

        return {
          category: category?.name || categoryData.categoryName,
          categoryImage: category?.image_url || "",
          products: categoryData.products
            .filter((product) => product.isActive)
            .map((product) => {
              let originalPrice = Number(product.price) || 0;
              let discountAmount = Number(product.discount_price) || 0;

              if (
                product.type === "variable" &&
                product.variants &&
                product.variants.length > 0
              ) {
                const firstVariant = product.variants[0];
                originalPrice = Number(firstVariant.price) || 0;
                discountAmount = Number(firstVariant.discount_price) || 0;
              }

              const hasDiscount = discountAmount > 0;
              const finalPrice = hasDiscount
                ? originalPrice - discountAmount
                : originalPrice;

              return {
                id: product.id,
                name: product.name,
                weight: product.item_code || "",
                description: product.description || "",
                image_url: String(product.image_url || "").split("?")[0],
                price: finalPrice,
                originalPrice: originalPrice,
                discount_price: discountAmount,
                discount: hasDiscount
                  ? `${Math.round((discountAmount / originalPrice) * 100)}% OFF`
                  : null,
                category: categoryData.categoryName,
                categoryId: categoryData.categoryId,
                type: product.type,
                taxPercentage: product.tax?.percentage || 0,
                taxName: product.tax?.name || "",

                variants:
                  product.variants?.map((variant) => {
                    const variantOriginalPrice = Number(variant.price) || 0;
                    const variantDiscountAmount =
                      Number(variant.discount_price) || 0;
                    const variantFinalPrice =
                      variantDiscountAmount > 0
                        ? variantOriginalPrice - variantDiscountAmount
                        : variantOriginalPrice;

                    return {
                      id: variant.id,
                      size: variant.size || variant.name || "",
                      price: variantFinalPrice,
                      originalPrice: variantOriginalPrice,
                      discountAmount: variantDiscountAmount,
                      stock: variant.stock || 0,
                      sku: variant.sku || "",
                      isAvailable: variant.isAvailable !== false,
                      image: variant.image_url || product.image_url || "",
                      ...variant,
                    };
                  }) || [],

                enrichedToppingGroups:
                  product.enriched_topping_groups?.map((group) => ({
                    id: group.id,
                    name: group.name,
                    required: group.required || false,
                    minSelection: group.min_selection || 0,
                    maxSelection: group.max_selection || 1,
                    toppings:
                      group.toppings?.map((topping) => ({
                        id: topping.id,
                        name: topping.name,
                        price: Number(topping.price) || 0,
                        isAvailable: topping.isAvailable !== false,
                        image: topping.image_url || "",
                      })) || [],
                  })) || [],

                allergyItems: product.allergy_items || [],
                ownerId: product.owner_id,
                storeId: product.store_id,
                displayOrder: product.display_order || 0,
                isVariableProduct: product.type === "variable",
                hasVariants: product.variants && product.variants.length > 0,
                hasToppings:
                  product.enriched_topping_groups &&
                  product.enriched_topping_groups.length > 0,

                selectedVariant:
                  product.variants && product.variants.length > 0
                    ? product.variants[0]
                    : null,
              };
            })
            .filter((product) => product.price > 0 || product.hasVariants),
        };
      })
      .filter((categoryData) => categoryData.products.length > 0);
  }, [categories, allProducts]);

  const handleAddToCart = (product) => {
    console.log("Adding to cart:", product);
  };

  const handleProductImageClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  if (error) {
    return <div className="error-message">Error: {error.message}</div>;
  }

  if (isLoading || categoryProducts.length === 0) {
    return <div className="loading-message">Loading products...</div>;
  }

  return (
    <div className="all-categories-container">
      {categoryProducts.map((categoryData, categoryIndex) => (
        <div key={categoryIndex} className="product-section">
          <h2 className="section-title">{categoryData.category}</h2>

          <div className="products-container">
            <div className="products-scroll">
              {categoryData.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onImageClick={handleProductImageClick}
                  onAddToCart={handleAddToCart}
                  currency={{ symbol: "€", locale: "de-DE" }}
                />
              ))}
            </div>

            <button className="scroll-arrow scroll-arrow-right">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

export default HomePageProductSection;
