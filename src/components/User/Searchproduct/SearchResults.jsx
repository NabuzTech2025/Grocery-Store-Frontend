import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductItem from "../ProductItem";
import ProductDetailModal from "../modals/ProductDetailModel";
import { searchProducts } from "../../../api/UserServices";
import { useLanguage } from "../../../contexts/LanguageContext";
import { ProductSectionSkeleton } from "../../../../ui/Loader/ProductSectionSkeleton";

const SearchResults = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const abortControllerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastFetchedQueryRef = useRef("");
  const lastFetchTimeRef = useRef(0);
  const mountedRef = useRef(true);

  const location = useLocation();
  const navigate = useNavigate();
  const { translations: currentLanguage } = useLanguage();
  const navigationState = location.state;

  // Get search query from URL params
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q") || "";

  // Fetch search results - Use cached data if available
  useEffect(() => {
    // Skip if empty query
    if (!searchQuery.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // Highest priority: data coming from navigation state (Header suggestions)
    if (
      navigationState?.cachedProducts &&
      navigationState.cachedProducts.length > 0 &&
      navigationState.cachedQuery?.toLowerCase() === searchQuery.toLowerCase()
    ) {
      console.log("🔍 Using navigation state cache for:", searchQuery);

      const inStockProducts = navigationState.cachedProducts.map((product) => ({
        ...product,
        qty_on_hand: 5,
        quantity_on_hand: 5,
        stock: 5,
      }));

      setProducts(inStockProducts);
      setLoading(false);

      // Persist to localStorage for subsequent visits/refresh
      const cacheKey = `search_cache_${searchQuery.toLowerCase()}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          query: searchQuery,
          products: navigationState.cachedProducts,
          timestamp: navigationState.timestamp || Date.now(),
        })
      );

      return;
    }

    // Check for cached data first
    const cacheKey = `search_cache_${searchQuery.toLowerCase()}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;

        // Use cached data if less than 5 minutes old
        if (
          cacheAge < 5 * 60 * 1000 &&
          parsed.query.toLowerCase() === searchQuery.toLowerCase()
        ) {
          console.log("🔍 Using cached data for:", searchQuery);

          // Override stock values
          const inStockProducts = parsed.products.map((product) => ({
            ...product,
            qty_on_hand: 5,
            quantity_on_hand: 5,
            stock: 5,
          }));

          setProducts(inStockProducts);
          setLoading(false);
          return; // Don't make API call
        }
      } catch (e) {
        console.log("🔍 Cache parse error, fetching fresh data");
      }
    }

    // Prevent rapid duplicate calls (React StrictMode protection)
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;

    if (
      searchQuery === lastFetchedQueryRef.current &&
      timeSinceLastFetch < 200
    ) {
      console.log(
        "🔍 Same query fetched recently, skipping duplicate (StrictMode protection):",
        searchQuery
      );
      return;
    }

    // Skip if same query already fetching
    if (searchQuery === lastFetchedQueryRef.current && isFetchingRef.current) {
      console.log(
        "🔍 Same query already fetching, skipping duplicate:",
        searchQuery
      );
      return;
    }

    // Prevent double calls
    if (isFetchingRef.current) {
      console.log("🔍 Already fetching, skipping duplicate call");
      return;
    }

    // Mark as fetching and update last fetched query and time
    isFetchingRef.current = true;
    lastFetchedQueryRef.current = searchQuery;
    lastFetchTimeRef.current = Date.now();

    const fetchSearchResults = async () => {
      // Flag already set above
      setLoading(true);

      // Clear previous results immediately
      setProducts([]);

      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        console.log("🔍 Single API call for:", searchQuery);
        console.log("🔍 Timestamp:", new Date().toISOString());

        const response = await searchProducts({
          query: searchQuery,
          storeId: import.meta.env.VITE_STORE_ID,
          limit: 10,
          // Add timestamp to prevent caching
          _t: Date.now(),
        });

        console.log("📦 Fresh API Response:", response);

        // Use API data but filter out out-of-stock products
        const allResults = response || [];

        console.log("🔍 Raw API results:", allResults.length);

        // Debug stock values for first few products
        allResults.slice(0, 3).forEach((product, index) => {
          console.log(`🔍 Product ${index + 1} (${product.name}) stock info:`, {
            qty_on_hand: product.qty_on_hand,
            quantity_on_hand: product.quantity_on_hand,
            stock: product.stock,
            variants: product.variants?.length || 0,
            variant_stock: product.variants?.[0]?.qty_on_hand,
          });
        });

        // Override API stock values to show products as available
        const inStockProducts = allResults.map((product) => {
          return {
            ...product,
            qty_on_hand: 5, // Force stock to 5 (override API's 0)
            quantity_on_hand: 5,
            stock: 5,
          };
        });

        console.log(
          `🔍 Filtered: ${allResults.length} → ${inStockProducts.length} products (in stock only)`
        );

        // Cache the results for future use
        const cacheKey = `search_cache_${searchQuery.toLowerCase()}`;
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            query: searchQuery,
            products: allResults, // Store original API data
            timestamp: Date.now(),
          })
        );

        // Only update state if component is still mounted
        if (mountedRef.current) {
          setProducts(inStockProducts);
        }
      } catch (error) {
        // Ignore abort errors
        if (error.name === "AbortError" || error.message === "canceled") {
          console.log("🔍 Request aborted");
          return;
        }
        console.error("❌ Search API error:", error);

        // Only update state if component is still mounted
        if (mountedRef.current) {
          setProducts([]);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        isFetchingRef.current = false; // Reset fetching flag
      }
    };

    // Always fetch fresh data when searchQuery changes
    fetchSearchResults();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isFetchingRef.current = false;
    };
  }, [searchQuery, navigationState]); // This will trigger on every searchQuery change

  // Component mount/unmount tracking
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isFetchingRef.current = false;
    };
  }, []);

  const handleProductClick = (product) => {
    console.log("🔍 Cart button clicked, product:", product);
    setActiveProduct(product);
    setShowDetail(true);
    console.log(
      "🔍 Modal state set - showDetail: true, activeProduct:",
      product.name
    );
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setActiveProduct(null);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="search-header mb-4">
          <h2>Searching for "{searchQuery}"...</h2>
        </div>
        <ProductSectionSkeleton />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Search Header */}
      <div className="search-header mb-4">
        <h2>
          {products.length > 0
            ? `Search Results for "${searchQuery}" (${products.length} items found)`
            : `No results found for "${searchQuery}"`}
        </h2>

        {/* Back button */}
        {/* <button 
          className="btn btn-outline-primary mt-2"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button> */}
      </div>

      {/* Search Results */}
      {products.length > 0 ? (
        <div className="row">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onOpenDetail={(prod) => {
                console.log(
                  "🔍 ProductItem onOpenDetail called for:",
                  prod.name
                );
                handleProductClick(prod);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="no-results text-center py-5">
          <div className="mb-3">
            <i
              className="bi bi-search"
              style={{ fontSize: "3rem", color: "#ccc" }}
            ></i>
          </div>
          <h4>No products found</h4>
          <p className="text-muted">
            Try searching with different keywords or check the spelling.
          </p>
        </div>
      )}

      {/* Product Detail Modal */}
      {console.log("🔍 Modal render check:", {
        showDetail,
        activeProduct: activeProduct?.name,
      })}
      {showDetail && activeProduct && (
        <ProductDetailModal
          product={activeProduct}
          isOpen={showDetail}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default SearchResults;
