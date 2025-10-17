import React, { useEffect, useRef } from 'react';

const ProductCardObserver = ({ product, onVisible, children }) => {
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible?.(product.category_id);
        }
      },
      {
        root: document.querySelector('.product-cnt-col'), // 👈 your scroll container
        threshold: 0.5,
      }
    );

    const current = ref.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [product.category_id, onVisible]);

  return <div ref={ref}>{children}</div>;
};

export default ProductCardObserver;
