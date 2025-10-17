// ProductSectionWrapper.jsx
import React, { useEffect, useRef } from 'react';

const ProductSectionWrapper = ({ category, onVisible, children }) => {
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(category.id);
        }
      },
      {
        root: document.querySelector('.hm-product-section'), // ← important fix
        threshold: 0.5
      }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [category.id, onVisible]);

  return <div ref={ref}>{children}</div>;
};

export default ProductSectionWrapper;
