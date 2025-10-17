import React, { useRef, useEffect, useState } from "react";
import { ProductCategorySkeleton } from "../../../ui/Loader/ProductCategorySkeleton";
import { useViewport } from "../../contexts/ViewportContext";
import { useCart } from "../../contexts/CartContext";
import { useLanguage } from "../../contexts/LanguageContext";

const ProductCategory = ({
  categories,
  onSelect,
  selectedCategoryId,
  isInitialized,
  loading = false,
  isshowSearchOnMobile = false,
}) => {
  const _imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "";
  const refs = useRef({});
  const scrollTimeoutRef = useRef(null);
  const { isMobileViewport } = useViewport();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const categoryListRef = useRef(null);
  const { itemCount } = useCart();
  const { translations: currentLanguage } = useLanguage();

  // Header visibility detection - separate from your scroll functionality
  useEffect(() => {
    if (!isMobileViewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
      }
    );

    // Try multiple possible header selectors
    const headerElement =
      document.querySelector("header") ||
      document.querySelector(".header") ||
      document.querySelector("#hero") ||
      document.querySelector('[class*="header"]');

    if (headerElement) {
      observer.observe(headerElement);
    }

    return () => {
      if (headerElement) {
        observer.unobserve(headerElement);
      }
    };
  }, [isMobileViewport, itemCount]);

  useEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (
      selectedCategoryId &&
      refs.current[selectedCategoryId] &&
      isInitialized
    ) {
      scrollTimeoutRef.current = setTimeout(() => {
        const element = refs.current[selectedCategoryId];
        if (element) {
          const container = element.closest(".hm-category-list");
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            // For mobile horizontal scroll, check left/right visibility
            // For desktop vertical scroll, check as before
            const isNotVisible = isMobileViewport
              ? elementRect.left < containerRect.left ||
                elementRect.right > containerRect.right
              : elementRect.left < containerRect.left ||
                elementRect.right > containerRect.right;

            if (isNotVisible) {
              if (isMobileViewport) {
                // Horizontal scroll for mobile
                const scrollLeft =
                  container.scrollLeft +
                  (elementRect.left - containerRect.left) -
                  containerRect.width / 2 +
                  elementRect.width / 2;

                container.scrollTo({
                  left: scrollLeft,
                  behavior: "smooth",
                });
              } else {
                // Vertical scroll for desktop (existing behavior)
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "start",
                });
              }
            }
          }
        }
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [selectedCategoryId, isInitialized, isMobileViewport]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (loading || !categories?.length) {
    return <ProductCategorySkeleton />;
  }

  if (!categories?.length)
    return <div>{currentLanguage.no_categories_available}</div>;

  return (
    <ul
      ref={categoryListRef}
      className={`sidebar hm-category-list ${
        isMobileViewport ? "mobile-horizontal" : ""
      }`}
    >
      {categories.map((category) => (
        <li
          key={`cat-${category.id}`}
          ref={(el) => (refs.current[category.id] = el)}
          style={{
            // Mobile: prevent shrinking and set minimum width
            ...(isMobileViewport && {
              flexShrink: 0,
              minWidth: "80px",
              listStyle: "none",
            }),
          }}
        >
          <a
            href="#"
            className={selectedCategoryId === category.id ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              onSelect(category.id);
            }}
            data-category-id={category.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "10px",
              borderRadius: "8px",
              // Mobile specific styles
              ...(isMobileViewport && {
                width: "80px",
                textDecoration: "none",
              }),
            }}
          >
            <img
              className="img-fluid"
              src={
                category.image_url
                  ? `${
                      category.image_url.split("?")[0] || "default-category.png"
                    }`
                  : "assets/images/default-category.png"
              }
              alt={category.name}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                marginBottom: "5px",
                borderRadius: isMobileViewport ? "50%" : "8px", // Circular on mobile
              }}
            />
            <h6
              style={{
                margin: 0,
                fontSize: isMobileViewport ? "12px" : "14px",
                // Apply different styles based on mobile and text type
                ...(isMobileViewport && {
                  maxWidth: "80px",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  lineHeight: "1.2",
                }),
              }}
              title={category.name}
            >
              {isMobileViewport
                ? (() => {
                    const words = category.name.split(" ").slice(0, 2); // nur die ersten 2 Wörter
                    return words.map((word, index) => (
                      <React.Fragment key={index}>
                        {word.length > 8
                          ? word.substring(0, 7) + ".."
                          : word + ".."}
                        {index < words.length - 1 && " "}
                      </React.Fragment>
                    ));
                  })()
                : category.name}
            </h6>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default ProductCategory;
