import React from "react";
import ProductItem from "./ProductItem";
import { ProductSectionSkeleton } from "../../../ui/Loader/ProductSectionSkeleton";
import { useLanguage } from "../../contexts/LanguageContext";

const ProductSection = ({ products, loading = false, loadingMore = false, onOpenDetail }) => {
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();
  if (loading) {
    return <ProductSectionSkeleton />;
  }

  if (!products?.length && !loading) {
    return (
      <div className="no-products">{currentLanguage.no_products_found}</div>
    );
  }

  return (
    <>
      <div className="row row-cols-1 row-cols-sm-4">
        {products.map((product) => (
          <div className="col" key={`prod-${product.id}`}>
            <ProductItem product={product} onOpenDetail={onOpenDetail} />
          </div>
        ))}
      </div>

      {/* Loading indicator for pagination */}
      {loadingMore && (
        <div className="row">
          <div className="col-12">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px",
                gap: "10px",
              }}
            >
              <div
                className="spinner-border spinner-border-sm"
                role="status"
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  borderWidth: "2px",
                }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductSection;
