import React, { useEffect, useState } from "react";
import "../../../../ui/css/HomeMain.css";
import shopTrolley from "../../../../public/assets/user/img/shopTrolley.png";
import { useStoreStatus } from "../../../contexts/StoreStatusContext";
import { getAvailableCategories } from "../../../utils/categoryAvailability";
import sortCategoriesByDisplayOrder from "../../../utils/helper/User/sortCategoriesByDisplayOrder";
import { getCategory } from "../../../api/UserServices";
import ImageMagnifier from "../../ImageMagnifier";
import ProductDetailModal from "../modals/ProductDetailModel";

function ProductSection() {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isCategoriesFetched, setIsCategoriesFetched] = useState(false);
  const [error, setError] = useState(null);
  const { serverTime } = useStoreStatus();
  const STORE_ID = import.meta.env.VITE_STORE_ID;
  const ITEMS_PER_PAGE = 20;

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Handle add to cart functionality
  const handleAddToCart = (product) => {
    console.log("Adding to cart:", product);
    // Add your cart logic here
    // This is a placeholder - you can integrate with your existing cart context
  };

  // Handle product image click
  const handleProductImageClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Fetch categories
  useEffect(() => {
    if (isCategoriesFetched) return;

    (async () => {
      try {
        const res = await getCategory(STORE_ID);
        const cats = res.data ?? res;

        const availableCategories = getAvailableCategories(cats, serverTime);
        const sortedCategories =
          sortCategoriesByDisplayOrder(availableCategories);

        setCategories(sortedCategories);
      } catch (err) {
        setError(err.message || "Failed to load categories");
      } finally {
        setIsCategoriesFetched(true);
      }
    })();
  }, [isCategoriesFetched, serverTime]);

  // Fetch products for all categories
  useEffect(() => {
    if (categories.length === 0) return;

    (async () => {
      try {
        const productsPromises = categories.map(async (category) => {
          const response = await fetch(
            `https://magskr.com/products/limitbycat/${ITEMS_PER_PAGE}?offset=0&store_id=${STORE_ID}&category_id=${category.id}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const productsData = await response.json();

          return {
            categoryId: category.id,
            categoryName: category.name,
            products: productsData,
          };
        });

        const allCategoryProducts = await Promise.all(productsPromises);
        setAllProducts(allCategoryProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      }
    })();
  }, [categories, STORE_ID]);

  // Transform combined data
  useEffect(() => {
    if (categories.length === 0 || allProducts.length === 0) return;

    const transformedData = allProducts
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
              // Handle variable products (get price from first variant)
              let productPrice = Number(product.price) || 0;
              let discountPrice = Number(product.discount_price) || 0;

              // If product is variable and has variants, use first variant price
              if (
                product.type === "variable" &&
                product.variants &&
                product.variants.length > 0
              ) {
                const firstVariant = product.variants[0];
                productPrice = Number(firstVariant.price) || 0;
                discountPrice = Number(firstVariant.discount_price) || 0;
              }

              const hasDiscount =
                discountPrice > 0 && discountPrice < productPrice;

              return {
                id: product.id,
                name: product.name,
                weight: product.item_code || "",
                description: product.description || "",
                image: String(product.image_url || "").split("?")[0],
                price: hasDiscount ? discountPrice : productPrice,
                originalPrice: productPrice,
                discount: hasDiscount
                  ? `${Math.round(
                      ((productPrice - discountPrice) / productPrice) * 100
                    )}% OFF`
                  : null,
                category: categoryData.categoryName,
                categoryId: categoryData.categoryId,
                type: product.type,
                taxPercentage: product.tax?.percentage || 0,
                taxName: product.tax?.name || "",

                // Store complete variant data
                variants:
                  product.variants?.map((variant) => ({
                    id: variant.id,
                    size: variant.size || variant.name || "",
                    price: Number(variant.price) || 0,
                    discountPrice: Number(variant.discount_price) || 0,
                    stock: variant.stock || 0,
                    sku: variant.sku || "",
                    isAvailable: variant.isAvailable !== false,
                    image: variant.image_url || product.image_url || "",
                    // Keep any additional variant properties
                    ...variant,
                  })) || [],

                // Store enriched topping groups for customization
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

                // Store allergy information
                allergyItems: product.allergy_items || [],

                // Additional metadata
                ownerId: product.owner_id,
                storeId: product.store_id,
                displayOrder: product.display_order || 0,

                // Flags
                isVariableProduct: product.type === "variable",
                hasVariants: product.variants && product.variants.length > 0,
                hasToppings:
                  product.enriched_topping_groups &&
                  product.enriched_topping_groups.length > 0,
              };
            })
            .filter((product) => product.price > 0 || product.hasVariants), // Include variable products even if base price is 0
        };
      })
      .filter((categoryData) => categoryData.products.length > 0);

    console.log("transformedData with variants ======>", transformedData);
    setCategoryProducts(transformedData);
  }, [categories, allProducts]);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (categoryProducts.length === 0) {
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
                <div key={product.id} className="product-card">
                  {product.discount && (
                    <div className="discount-badge">{product.discount}</div>
                  )}

                  <div className="product-image" onClick={() => handleProductImageClick(product)}>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                        cursor: "pointer",
                        borderRadius: "8px",
                        border: "2px solid #f8f9fa",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-weight">{product.weight}</p>

                    <div className="product-footer">
                      <div className="price-container">
                        <span className="current-price">
                          {(product.price ?? 0).toFixed(2)} €
                        </span>
                        {product.discount && product.originalPrice && (
                          <span className="original-price">
                            {(product.originalPrice ?? 0).toFixed(2)} €
                          </span>
                        )}
                      </div>

                      <button
                        className="add-to-cart"
                        onClick={() => handleAddToCart(product)}
                      >
                        <img
                          style={{ width: "25px", height: "25px" }}
                          src={shopTrolley}
                          alt="shop Trolley"
                        />
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Product Detail Modal */}
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

export default ProductSection;
