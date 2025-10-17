import React, { useState, useEffect, useCallback, useRef } from "react";
import ProductCategory from "../ProductCategory";
import ProductSection from "../ProductSection";
import { getCategory } from "@/api/UserServices";
import { debounce } from "lodash";
import { useStoreStatus } from "../../../contexts/StoreStatusContext";
import Footer from "@/components/User/Footer";
import { StoreStatusSkeleton } from "../../../../ui/Loader/StoreStatusSkeleton";
import sortCategoriesByDisplayOrder from "../../../utils/helper/User/sortCategoriesByDisplayOrder";
import { BiLoader } from "react-icons/bi";
import { useViewport } from "../../../contexts/ViewportContext";
import OrderTypeButtons from "./OrderTypeButtons";
import "../../../../ui/css/product_area.css";
import StoreTitle from "./StoreTitle";
import MobileSearchBar from "./MobileSearchBar";
import {
  filterAvailableCategories,
  isCategoryAvailable,
} from "../../../utils/categoryAvailability";
import { useLanguage } from "../../../contexts/LanguageContext";

const ProductsArea = ({ searchTerm }) => {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState({});
  const [categoryMeta, setCategoryMeta] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState({ categories: true, products: true });
  const [loadingMore, setLoadingMore] = useState({});
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isUserClick = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const observerRefs = useRef({});
  const { isMobileViewport } = useViewport();
  const [isCategoriesFetched, setIsCategoriesFetched] = useState(false);

  // Search handling
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const effectiveSearchTerm = localSearchTerm || searchTerm || "";
  const [isbannerShow, setIsbannerShow] = useState(false);

  // Animation states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isshowSearchOnMobile, setIsshowSearchMobile] = useState(false);
  const { translations: currentLanguage } = useLanguage();

  const onChangeSearch = (e) => {
    const val = e.target.value;
    setLocalSearchTerm(val);
  };

  const { store, error: storeError, serverTime } = useStoreStatus();
  const ITEMS_PER_PAGE = 20;
  const STORE_ID = import.meta.env.VITE_STORE_ID;
  const APP_BASE_ROUTE = import.meta.env.VITE_APP_NAME || "";

  // Enhanced banner visibility check with smooth transitions
  useEffect(() => {
    const checkBannerVisibility = () => {
      const headerElement = document.querySelector("header#header");
      const heroElement = document.querySelector(
        'section.hero-section, .hero-section, [class*="hero"]'
      );

      if (!headerElement && !heroElement) return;

      const headerHeight = headerElement?.offsetHeight || 0;
      const heroHeight = heroElement?.offsetHeight || 0;
      const totalBannerHeight = headerHeight + heroHeight;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const bannerVisibilityThreshold = totalBannerHeight * 0.8;
      const isBannerVisible = scrollY < bannerVisibilityThreshold;

      // Update state only if changed
      if (isBannerVisible !== isbannerShow) {
        setIsbannerShow(isBannerVisible);
      }

      // Update body classes for CSS targeting
      document.body.classList.toggle("banner-visible", isBannerVisible);
      document.body.classList.toggle("banner-hidden", !isBannerVisible);
    };

    // Throttled scroll handler for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkBannerVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    checkBannerVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkBannerVisibility);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkBannerVisibility);
    };
  }, [isbannerShow]);

  // Cache management functions
  const getCacheKey = (categoryId, offset) =>
    `products_${APP_BASE_ROUTE}_${categoryId}_${offset}`;
  const getCacheTimeKey = (categoryId) =>
    `products_time_${APP_BASE_ROUTE}_${categoryId}`;
  const getMetaCacheKey = (categoryId) =>
    `products_meta_${APP_BASE_ROUTE}_${categoryId}`;

  const CACHE_MAX_AGE = 1000 * 60 * 5; // 5 minutes

  const removeDuplicateProducts = (products) => {
    const seen = new Set();
    return products.filter((product) => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  };

  const loadProductsForCategory = async (
    categoryId,
    offset = 0,
    useCache = true
  ) => {
    const cacheKey = getCacheKey(categoryId, offset);
    const cacheTimeKey = getCacheTimeKey(categoryId);
    const metaCacheKey = getMetaCacheKey(categoryId);

    if (useCache) {
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);
      const cachedMeta = localStorage.getItem(metaCacheKey);

      if (cachedData && cachedTime && cachedMeta) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < CACHE_MAX_AGE) {
          const products = JSON.parse(cachedData);
          const meta = JSON.parse(cachedMeta);
          return { products, meta };
        }
      }
    }

    try {
      const response = await fetch(
        `https://magskr.com/products/limitbycat/${ITEMS_PER_PAGE}?offset=${offset}&store_id=${STORE_ID}&category_id=${categoryId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const products = Array.isArray(data) ? data : [];

      const meta = {
        hasMore: products.length === ITEMS_PER_PAGE,
        currentOffset: offset,
        totalLoaded: offset + products.length,
      };

      localStorage.setItem(cacheKey, JSON.stringify(products));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
      localStorage.setItem(metaCacheKey, JSON.stringify(meta));

      return { products, meta };
    } catch (error) {
      console.error(
        `Error loading products for category ${categoryId}:`,
        error
      );
      return {
        products: [],
        meta: { hasMore: false, currentOffset: offset, totalLoaded: offset },
      };
    }
  };

  const loadMoreProducts = async (categoryId) => {
    if (loadingMore[categoryId]) return;

    setLoadingMore((prev) => ({ ...prev, [categoryId]: true }));

    try {
      const currentMeta = categoryMeta[categoryId] || { currentOffset: 0 };
      const nextOffset = currentMeta.currentOffset + ITEMS_PER_PAGE;

      const { products: newProducts, meta: newMeta } =
        await loadProductsForCategory(categoryId, nextOffset, true);

      if (newProducts.length > 0) {
        setAllProducts((prev) => {
          const existingProducts = prev[categoryId] || [];
          const combinedProducts = [...existingProducts, ...newProducts];
          const uniqueProducts = removeDuplicateProducts(combinedProducts);

          return {
            ...prev,
            [categoryId]: uniqueProducts,
          };
        });

        setCategoryMeta((prev) => ({
          ...prev,
          [categoryId]: {
            ...newMeta,
            totalLoaded:
              (prev[categoryId]?.totalLoaded || 0) + newProducts.length,
          },
        }));
      } else {
        setCategoryMeta((prev) => ({
          ...prev,
          [categoryId]: {
            ...currentMeta,
            hasMore: false,
          },
        }));
      }
    } catch (error) {
      console.error(
        `Error loading more products for category ${categoryId}:`,
        error
      );
    } finally {
      setLoadingMore((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const setupIntersectionObserver = useCallback(
    (categoryId) => {
      const targetId = `load-more-trigger-${categoryId}`;
      const target = document.getElementById(targetId);

      if (!target) return;

      if (observerRefs.current[categoryId]) {
        observerRefs.current[categoryId].disconnect();
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              categoryMeta[categoryId]?.hasMore &&
              !loadingMore[categoryId] &&
              !isUserClick.current // Don't load more during user navigation
            ) {
              console.log("Loading more products for category:", categoryId);
              loadMoreProducts(categoryId);
            }
          });
        },
        {
          rootMargin: "100px",
          threshold: 0.1,
        }
      );

      observer.observe(target);
      observerRefs.current[categoryId] = observer;
    },
    [categoryMeta, loadingMore, isUserClick]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      categories.forEach((category) => {
        if (allProducts[category.id] && categoryMeta[category.id]?.hasMore) {
          setupIntersectionObserver(category.id);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [categories, allProducts, categoryMeta, setupIntersectionObserver]);

  useEffect(() => {
    return () => {
      Object.values(observerRefs.current).forEach((observer) => {
        if (observer) observer.disconnect();
      });
    };
  }, []);

  // Improved scroll spy logic
  const improvedHandleScrollSpy = useCallback(() => {
    if (isUserClick.current) return;

    const scrollY = window.pageYOffset;
    const stickyHeaderHeight =
      document.getElementById("store-title-area")?.offsetHeight || 0;

    // Get viewport height for better calculation
    const viewportHeight = window.innerHeight;
    const centerPoint = scrollY + viewportHeight / 2;

    const sections = categories
      .map((category) => {
        const element = document.getElementById(`cat-section-${category.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;
          const elementBottom = elementTop + rect.height;

          return {
            id: category.id,
            element: element,
            top: elementTop - stickyHeaderHeight,
            bottom: elementBottom - stickyHeaderHeight,
            center: elementTop + rect.height / 2,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (sections.length === 0) return;

    // Find the section closest to the center of the viewport
    let activeSection = sections[0];
    let minDistance = Math.abs(centerPoint - sections[0].center);

    sections.forEach((section) => {
      const distance = Math.abs(centerPoint - section.center);
      if (distance < minDistance) {
        minDistance = distance;
        activeSection = section;
      }
    });

    // Only update if the active section has changed
    if (activeSection && activeSection.id !== selectedCategoryId) {
      setSelectedCategoryId(activeSection.id);

      // Update category navigation
      const categoryElement = document.querySelector(
        `.hm-category-list li a[data-category-id="${activeSection.id}"]`
      )?.parentElement;

      if (categoryElement) {
        const container = document.querySelector(".hm-category-list");
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = categoryElement.getBoundingClientRect();

          const isNotVisible =
            elementRect.left < containerRect.left ||
            elementRect.right > containerRect.right ||
            elementRect.top < containerRect.top ||
            elementRect.bottom > containerRect.bottom;

          if (isNotVisible) {
            const scrollLeft =
              container.scrollLeft +
              (elementRect.left - containerRect.left) -
              containerRect.width / 2 +
              elementRect.width / 2;

            container.scrollTo({
              left: scrollLeft,
              behavior: "smooth",
            });
          }
        }
      }
    }
  }, [categories, selectedCategoryId]);

  // Update the debounced scroll spy to use the improved version
  const debouncedScrollSpy = useCallback(
    debounce(improvedHandleScrollSpy, 50), // Slightly increased debounce for better performance
    [improvedHandleScrollSpy]
  );

  useEffect(() => {
    if (categories.length > 0 && isInitialized) {
      window.addEventListener("scroll", debouncedScrollSpy);
      return () => {
        window.removeEventListener("scroll", debouncedScrollSpy);
        debouncedScrollSpy.cancel();
      };
    }
  }, [categories, isInitialized, debouncedScrollSpy]);

  useEffect(() => {
    return () => {
      debouncedScrollSpy.cancel();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [debouncedScrollSpy]);

  const getAvailableCategories = useCallback((categories, serverTime) => {
    if (!serverTime) {
      // If no server time, show all categories (fallback)
      return categories;
    }

    return filterAvailableCategories(categories, serverTime);
  }, []);

  useEffect(() => {
    if (isCategoriesFetched) return;

    (async () => {
      try {
        const res = await getCategory(STORE_ID);
        const cats = res.data ?? res;

        // Filter categories based on availability
        const availableCategories = getAvailableCategories(cats, serverTime);

        const sortedCategories =
          sortCategoriesByDisplayOrder(availableCategories);

        setCategories(sortedCategories);

        if (sortedCategories.length > 0) {
          // Select the FIRST category after sorting
          setSelectedCategoryId(sortedCategories[0].id);
          setIsInitialized(true);
        }
      } catch (err) {
        setError(err.message || "Failed to load categories");
      } finally {
        setLoading((l) => ({ ...l, categories: false }));
        setIsCategoriesFetched(true);
      }
    })();
  }, [isCategoriesFetched, serverTime, getAvailableCategories]);

  // Add a new useEffect to re-filter categories when serverTime changes
  useEffect(() => {
    if (categories.length === 0 || !serverTime) return;

    // Re-fetch and filter categories when server time updates
    (async () => {
      try {
        const res = await getCategory(STORE_ID);
        const cats = res.data ?? res;
        const availableCategories = getAvailableCategories(cats, serverTime);

        console.log("Re-filtering categories based on time:", serverTime);
        console.log("Available categories now:", availableCategories);

        // Only update if the available categories have changed
        const currentCategoryIds = categories.map((cat) => cat.id).sort();
        const newCategoryIds = availableCategories.map((cat) => cat.id).sort();

        if (
          JSON.stringify(currentCategoryIds) !== JSON.stringify(newCategoryIds)
        ) {
          setCategories(availableCategories);

          // Update selected category if current one is no longer available
          if (
            selectedCategoryId &&
            !availableCategories.find((cat) => cat.id === selectedCategoryId)
          ) {
            if (availableCategories.length > 0) {
              setSelectedCategoryId(availableCategories[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Error re-filtering categories:", err);
      }
    })();
  }, [serverTime]);

  useEffect(() => {
    const loadInitialProducts = async () => {
      if (categories.length === 0) return;

      try {
        const productsData = {};
        const metaData = {};

        await Promise.all(
          categories.map(async (category) => {
            const { products, meta } = await loadProductsForCategory(
              category.id,
              0,
              true
            );
            productsData[category.id] = removeDuplicateProducts(products);
            metaData[category.id] = meta;
          })
        );

        setAllProducts(productsData);
        setCategoryMeta(metaData);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading((l) => ({ ...l, products: false }));
      }
    };

    loadInitialProducts();
  }, [categories]);

  useEffect(() => {
    if (isMobileViewport) {
      document.body.classList.toggle(
        "mobile-search-visible",
        isshowSearchOnMobile
      );
    }

    return () => {
      document.body.classList.remove("mobile-search-visible");
    };
  }, [isshowSearchOnMobile, isMobileViewport]);

  // Enhanced handleCategorySelect function
  const handleCategorySelect = (id) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Clear search term and hide mobile search
    setLocalSearchTerm("");
    setIsshowSearchMobile(false);
    setSelectedCategoryId(id);
    isUserClick.current = true;

    // Store the target category ID for tracking
    const targetCategoryId = id;

    // Disable intersection observers temporarily to prevent unwanted loading
    const tempDisableObservers = () => {
      Object.values(observerRefs.current).forEach((observer) => {
        if (observer) observer.disconnect();
      });
    };

    // Re-enable intersection observers after scrolling settles
    const reEnableObservers = () => {
      setTimeout(() => {
        categories.forEach((category) => {
          if (allProducts[category.id] && categoryMeta[category.id]?.hasMore) {
            setupIntersectionObserver(category.id);
          }
        });
      }, 100);
    };

    // Enhanced scroll function that maintains precise positioning
    const scrollToCategory = () => {
      const titleElement = document.querySelector(
        `#cat-section-${targetCategoryId} .products-categroy-title-row`
      );
      const sectionElement = document.getElementById(
        `cat-section-${targetCategoryId}`
      );
      const targetElement = titleElement || sectionElement;

      if (targetElement) {
        const stickyHeaderHeight =
          document.getElementById("store-title-area")?.offsetHeight || 0;
        const SCROLL_OFFSET = isMobileViewport ? 135 : 25;

        // Calculate target position more precisely
        const targetRect = targetElement.getBoundingClientRect();
        const currentScrollY = window.pageYOffset;
        const targetScrollY =
          currentScrollY + targetRect.top - stickyHeaderHeight - SCROLL_OFFSET;

        // Ensure we don't scroll to negative position
        const finalScrollY = Math.max(0, targetScrollY);

        console.log("Scrolling to category:", targetCategoryId, {
          currentScrollY,
          targetRect: { top: targetRect.top, height: targetRect.height },
          stickyHeaderHeight,
          SCROLL_OFFSET,
          finalScrollY,
        });

        window.scrollTo({
          top: finalScrollY,
          behavior: "smooth",
        });

        return finalScrollY;
      }
      return null;
    };

    // Temporarily disable observers to prevent loading during scroll
    tempDisableObservers();

    // Wait for React re-render, then handle scrolling
    setTimeout(() => {
      const sortedCategories = sortCategoriesByDisplayOrder(categories);
      const selectedCategoryIndex = sortedCategories.findIndex(
        (cat) => cat.id === targetCategoryId
      );
      const categoriesAbove = sortedCategories.slice(0, selectedCategoryIndex);

      // Check current loading states
      const currentlyLoading = categoriesAbove.filter(
        (category) => loadingMore[category.id]
      );

      if (currentlyLoading.length > 0) {
        // Wait for currently loading content to finish
        const waitForCurrentLoading = () => {
          const stillLoading = currentlyLoading.some(
            (category) => loadingMore[category.id]
          );

          if (!stillLoading) {
            // Current loading finished, now scroll
            const targetScrollY = scrollToCategory();

            // Set up monitoring for any new content that might load
            if (targetScrollY !== null) {
              const monitorContentChanges = () => {
                setTimeout(() => {
                  const newTargetElement = document.getElementById(
                    `cat-section-${targetCategoryId}`
                  );
                  if (newTargetElement) {
                    const newTargetRect =
                      newTargetElement.getBoundingClientRect();
                    const currentScrollY = window.pageYOffset;
                    const stickyHeaderHeight =
                      document.getElementById("store-title-area")
                        ?.offsetHeight || 0;
                    const SCROLL_OFFSET = isMobileViewport ? 135 : 25;

                    // Check if the element has moved significantly from expected position
                    const expectedPosition = stickyHeaderHeight + SCROLL_OFFSET;
                    const actualPosition = newTargetRect.top;
                    const positionDifference = Math.abs(
                      actualPosition - expectedPosition
                    );

                    // If position has changed significantly, readjust
                    if (positionDifference > 30) {
                      const adjustedScrollY =
                        currentScrollY + (actualPosition - expectedPosition);
                      console.log(
                        "Adjusting scroll position due to content changes:",
                        {
                          expectedPosition,
                          actualPosition,
                          positionDifference,
                          adjustedScrollY,
                        }
                      );

                      window.scrollTo({
                        top: Math.max(0, adjustedScrollY),
                        behavior: "smooth",
                      });
                    }
                  }
                }, 300); // Wait a bit for content to settle
              };

              // Monitor for content changes for a short period
              monitorContentChanges();
              setTimeout(monitorContentChanges, 600);
              setTimeout(monitorContentChanges, 1000);
            }

            // Re-enable observers after scrolling and monitoring
            setTimeout(() => {
              reEnableObservers();
            }, 1200);
          } else {
            // Still loading, check again
            setTimeout(waitForCurrentLoading, 100);
          }
        };

        waitForCurrentLoading();
      } else {
        // No current loading, scroll immediately
        const targetScrollY = scrollToCategory();

        // Still monitor for potential content changes
        if (targetScrollY !== null) {
          setTimeout(() => {
            const newTargetElement = document.getElementById(
              `cat-section-${targetCategoryId}`
            );
            if (newTargetElement) {
              const newTargetRect = newTargetElement.getBoundingClientRect();
              const stickyHeaderHeight =
                document.getElementById("store-title-area")?.offsetHeight || 0;
              const SCROLL_OFFSET = isMobileViewport ? 135 : 25;
              const expectedPosition = stickyHeaderHeight + SCROLL_OFFSET;
              const actualPosition = newTargetRect.top;
              const positionDifference = Math.abs(
                actualPosition - expectedPosition
              );

              if (positionDifference > 30) {
                const currentScrollY = window.pageYOffset;
                const adjustedScrollY =
                  currentScrollY + (actualPosition - expectedPosition);

                window.scrollTo({
                  top: Math.max(0, adjustedScrollY),
                  behavior: "smooth",
                });
              }
            }
          }, 500);
        }

        // Re-enable observers
        setTimeout(() => {
          reEnableObservers();
        }, 800);
      }
    }, 100);

    // Reset user click flag after a longer delay
    setTimeout(() => {
      isUserClick.current = false;
    }, 2000);
  };

  // Additional useEffect to handle content changes
  useEffect(() => {
    // Recalculate positions when products are loaded or updated
    const recalculatePositions = () => {
      if (isUserClick.current && selectedCategoryId) {
        // If user just clicked a category, ensure proper scrolling after content loads
        const targetElement = document.getElementById(
          `cat-section-${selectedCategoryId}`
        );
        if (targetElement) {
          const stickyHeaderHeight =
            document.getElementById("store-title-area")?.offsetHeight || 0;
          const SCROLL_OFFSET = isMobileViewport ? 135 : 25;

          const elementPosition =
            targetElement.getBoundingClientRect().top + window.pageYOffset;
          const currentScrollPosition = window.pageYOffset;
          const idealPosition =
            elementPosition - stickyHeaderHeight - SCROLL_OFFSET;

          // Only adjust if we're significantly off from the ideal position
          const difference = Math.abs(currentScrollPosition - idealPosition);
          if (difference > 50) {
            window.scrollTo({
              top: Math.max(0, idealPosition),
              behavior: "smooth",
            });
          }
        }
      }
    };

    // Delay to allow DOM updates
    const timeoutId = setTimeout(recalculatePositions, 300);

    return () => clearTimeout(timeoutId);
  }, [allProducts, selectedCategoryId, isMobileViewport]);

  // MutationObserver to detect when content height changes - Enhanced version
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      // Only act if user clicked on a category
      if (!isUserClick.current || !selectedCategoryId) return;

      let shouldRecalculate = false;
      let affectedCategoryId = null;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if product elements were added
          const hasProductNodes = Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              (node.classList?.contains("product-item") ||
                node.querySelector?.(".product-item"))
          );

          if (hasProductNodes) {
            // Try to determine which category was affected
            const parentSection = mutation.target.closest(
              '[id^="cat-section-"]'
            );
            if (parentSection) {
              const categoryId = parentSection.id.replace("cat-section-", "");
              affectedCategoryId = categoryId;

              // Only recalculate if the affected category is above the selected one
              const sortedCategories = sortCategoriesByDisplayOrder(categories);
              const selectedIndex = sortedCategories.findIndex(
                (cat) => cat.id === selectedCategoryId
              );
              const affectedIndex = sortedCategories.findIndex(
                (cat) => cat.id === categoryId
              );

              if (affectedIndex < selectedIndex) {
                shouldRecalculate = true;
              }
            }
          }
        }
      });

      if (shouldRecalculate && affectedCategoryId) {
        console.log(
          "Content added to category above selected category:",
          affectedCategoryId,
          "Selected:",
          selectedCategoryId
        );

        // Recalculate scroll position after content loads
        setTimeout(() => {
          const targetElement = document.getElementById(
            `cat-section-${selectedCategoryId}`
          );
          if (targetElement) {
            const stickyHeaderHeight =
              document.getElementById("store-title-area")?.offsetHeight || 0;
            const SCROLL_OFFSET = isMobileViewport ? 135 : 25;

            const targetRect = targetElement.getBoundingClientRect();
            const currentScrollY = window.pageYOffset;
            const expectedPosition = stickyHeaderHeight + SCROLL_OFFSET;
            const actualPosition = targetRect.top;

            // Only adjust if the position has changed significantly
            const positionDifference = actualPosition - expectedPosition;

            if (Math.abs(positionDifference) > 20) {
              const adjustedScrollY = currentScrollY - positionDifference;

              console.log("Adjusting scroll due to content load:", {
                expectedPosition,
                actualPosition,
                positionDifference,
                currentScrollY,
                adjustedScrollY,
              });

              window.scrollTo({
                top: Math.max(0, adjustedScrollY),
                behavior: "smooth",
              });
            }
          }
        }, 150); // Slightly longer delay to ensure content is fully rendered
      }
    });

    const productArea = document.getElementById("hm-product-area");
    if (productArea) {
      observer.observe(productArea, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, [selectedCategoryId, isMobileViewport, categories]);

  if (storeError && !store) {
    return (
      <div
        className="error-container"
        style={{ padding: "20px", textAlign: "center" }}
      >
        <h3>Unable to load store information</h3>
        <p>{storeError}</p>
      </div>
    );
  }

  if (error) return <div className="error">Error: {error}</div>;
  if (!store) return null;

  const getFilteredProducts = (categoryId) => {
    const categoryProducts = allProducts[categoryId] || [];
    const uniqueProducts = removeDuplicateProducts(categoryProducts);

    if (!effectiveSearchTerm || !effectiveSearchTerm.trim()) {
      return uniqueProducts;
    }

    return uniqueProducts.filter((product) =>
      product.name
        .toLowerCase()
        .includes(effectiveSearchTerm.toLowerCase().trim())
    );
  };

  // Update the sortedCategories and activeCategories logic
  const sortedCategories = sortCategoriesByDisplayOrder(categories);
  const activeCategories = sortedCategories.filter((category) => {
    const filteredProducts = getFilteredProducts(category.id);
    // Double-check availability in case serverTime changed recently
    const isAvailable = isCategoryAvailable(category, serverTime);
    return filteredProducts.length > 0 && isAvailable;
  });

  if (loading.categories || loading.products) {
    return (
      <>
        <StoreStatusSkeleton />
        <section id="hm-product-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="hm-content-area">
                  <ProductCategory
                    categories={categories}
                    onSelect={() => {}}
                    selectedCategoryId={null}
                    isInitialized={false}
                    loading={true}
                    isshowSearchOnMobile={isshowSearchOnMobile}
                  />
                  <div className="hm-product-section">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={`category-section-skeleton-${index}`}
                        className="mb-8"
                      >
                        <div className="products-categroy-title-row mb-6">
                          <div
                            className="relative overflow-hidden bg-gray-200 rounded mb-2"
                            style={{ height: "32px", width: "192px" }}
                          >
                            <div
                              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                              style={{
                                animation: "shimmer 2s infinite",
                                animationDelay: `${index * 0.2}s`,
                              }}
                            ></div>
                          </div>
                          <div
                            className="relative overflow-hidden bg-gray-200 rounded"
                            style={{ height: "16px", width: "384px" }}
                          >
                            <div
                              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                              style={{
                                animation: "shimmer 2s infinite",
                                animationDelay: `${index * 0.2 + 0.2}s`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <ProductSection products={[]} loading={true} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section
        id="store-title-area"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          backgroundColor: "#fff",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container">
          {isMobileViewport && isbannerShow && !isshowSearchOnMobile && (
            <OrderTypeButtons />
          )}
          <div className="row align-items-center header-row-style">
            {isMobileViewport ? (
              // Mobile behavior with smooth transitions - render both components
              <>
                {/* MobileSearchBar with smooth transitions */}
                <div
                  className={`mobile-search-container ${
                    isshowSearchOnMobile ? "visible" : "hidden"
                  }`}
                  style={{
                    position: "absolute",
                    top: "6px",
                    left: 0,
                    right: 0,
                    zIndex: isshowSearchOnMobile ? 10 : -1,
                    opacity: isshowSearchOnMobile ? 1 : 0,
                    transform: isshowSearchOnMobile
                      ? "translateY(0)"
                      : "translateY(-20px)",
                    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    pointerEvents: isshowSearchOnMobile ? "auto" : "none",
                  }}
                >
                  <MobileSearchBar
                    isVisible={isshowSearchOnMobile}
                    onClose={() => {
                      setLocalSearchTerm("");
                      setIsshowSearchMobile(false);
                    }}
                    searchTerm={localSearchTerm}
                    onSearchChange={onChangeSearch}
                  />
                </div>

                {/* StoreTitle with smooth transitions */}
                <div
                  className={`col-lg-5 col-sm-4 col-xs-6 col-6 title-hide-mobile store-title-container ${
                    !isshowSearchOnMobile ? "visible" : "hidden"
                  }`}
                  style={{
                    opacity: !isshowSearchOnMobile ? 1 : 0,
                    transform: !isshowSearchOnMobile
                      ? "translateY(0)"
                      : "translateY(-20px)",
                    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    pointerEvents: !isshowSearchOnMobile ? "auto" : "none",
                  }}
                >
                  <StoreTitle isbannerShow={isbannerShow} />
                </div>
              </>
            ) : (
              // Desktop behavior remains the same
              <div className="col-lg-5 col-sm-4 col-xs-6 col-6 title-hide-mobile">
                <StoreTitle isbannerShow={isbannerShow} />
              </div>
            )}

            <div className="col-lg-7 col-sm-8 col-xs-6 col-6 d-flex align-items-center justify-content-end gap-2">
              {/* Search Input with smooth animation */}
              <div
                className="header-search search-container"
                style={{
                  transform: isTransitioning
                    ? "translateX(-5px)"
                    : "translateX(0)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div
                  className="form"
                  style={{ position: "relative", width: "100%" }}
                >
                  <input
                    type="text"
                    className="form-control form-input"
                    placeholder={`${currentLanguage.search_anything}...`}
                    value={localSearchTerm}
                    onChange={onChangeSearch}
                    style={{
                      width: "100%",
                      paddingRight: "50px",
                      border: "1px solid #ccc",
                      borderRadius: "25px",
                      paddingLeft: "15px",
                      height: "50px",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#007bff";
                      e.target.style.boxShadow =
                        "0 0 0 0.2rem rgba(0,123,255,.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#ccc";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <img
                    src={`assets/user/img/search-icon.svg`}
                    alt="Search"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-50%) scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(-50%) scale(1)";
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Delivery / Pickup Buttons with enhanced animations */}
              {!isMobileViewport && <OrderTypeButtons />}

              {!isshowSearchOnMobile && (
                <a
                  className="mobile-search d-sm-none"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsshowSearchMobile(true);
                  }}
                  style={{
                    transition: "all 0.2s ease-in-out",
                    transform: "scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  <img src={`assets/user/img/search-icon.svg`} alt="Search" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Area with fade-in animation */}
      <section
        id="hm-product-area"
        className="fade-in"
        style={{
          opacity: loading.categories || loading.products ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="hm-content-area">
                <ProductCategory
                  categories={sortedCategories}
                  onSelect={handleCategorySelect}
                  selectedCategoryId={selectedCategoryId}
                  isInitialized={isInitialized}
                  loading={loading.categories}
                />

                {activeCategories.length === 0 && (
                  <div
                    className="no-products-found fade-in"
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      opacity: 0,
                      animation: "fadeIn 0.5s ease-in-out 0.3s forwards",
                    }}
                  >
                    <p>{currentLanguage.no_products_found}</p>
                  </div>
                )}

                <div className="hm-product-section">
                  {activeCategories.map((category, index) => {
                    const filteredProducts = getFilteredProducts(category.id);
                    const hasMore = categoryMeta[category.id]?.hasMore;
                    const isLoadingMore = loadingMore[category.id];

                    return (
                      <div
                        key={category.id}
                        id={`cat-section-${category.id}`}
                        style={{
                          marginBottom: "2rem",
                          opacity: 0,
                          animation: `slideInFromBottom 0.5s ease-out ${
                            index * 0.1
                          }s forwards`,
                        }}
                      >
                        <div
                          className="products-categroy-title-row"
                          style={{
                            opacity: 0,
                            animation: `slideInFromTop 0.4s ease-out ${
                              index * 0.1 + 0.2
                            }s forwards`,
                          }}
                        >
                          <h2>{category.name}</h2>
                          <p>{category.description}</p>
                        </div>

                        <ProductSection
                          products={filteredProducts}
                          loading={false}
                          loadingMore={isLoadingMore}
                        />

                        {/* Load More Trigger with animation */}
                        {hasMore && (
                          <div
                            id={`load-more-trigger-${category.id}`}
                            style={{
                              height: "20px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              margin: "20px 0",
                              transition: "all 0.3s ease-in-out",
                            }}
                          >
                            {isLoadingMore && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  color: "#666",
                                  opacity: 0,
                                  animation: "fadeIn 0.3s ease-in-out forwards",
                                }}
                              >
                                <BiLoader
                                  style={{
                                    animation: "spin 1s linear infinite",
                                    fontSize: "20px",
                                  }}
                                />
                                <span>Loading more products...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ProductsArea;
