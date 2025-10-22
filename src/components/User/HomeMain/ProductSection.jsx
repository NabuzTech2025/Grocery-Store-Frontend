import React from "react";
import "../../../../ui/css/HomeMain.css";
import shopTrolley from "../../../../public/assets/user/img/shopTrolley.png";

function ProductSection() {
  const CategoryProducts = [
    {
      category: "Cheese, Eggs & Dairy",
      products: [
        {
          id: 1,
          name: "Philadelphia Cream Cheese Natural Double Cream",
          weight: "330g (1 kg = 11.48 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.79,
          originalPrice: 3.9,
          discount: "20% OFF",
        },
        {
          id: 2,
          name: "Meggle Kräuter-Tube vegan 80ml",
          weight: "80ml (1 l = 31.13 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 2.94,
          originalPrice: 3.0,
          discount: "20% OFF",
        },
        {
          id: 3,
          name: "Philadelphia Cream Cheese Natural Double Cream",
          weight: "330g (1 kg = 11.48 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.79,
          originalPrice: 3.9,
          discount: "20% OFF",
        },
        {
          id: 4,
          name: "Meggle Kräuter-Tube vegan 80ml",
          weight: "80ml (1 l = 31.13 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 2.94,
          originalPrice: 3.0,
          discount: "20% OFF",
        },
        {
          id: 5,
          name: "Philadelphia Cream Cheese Natural Double Cream",
          weight: "330g (1 kg = 11.48 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.79,
          originalPrice: 3.9,
          discount: "20% OFF",
        },
        {
          id: 6,
          name: "Organic Free Range Eggs Large",
          weight: "6 pieces (1 piece = 0.58 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.49,
          originalPrice: 3.99,
          discount: "15% OFF",
        },
        {
          id: 7,
          name: "Butter Unsalted Premium Quality",
          weight: "250g (1 kg = 15.96 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 3.99,
          originalPrice: 4.49,
          discount: "15% OFF",
        },
        {
          id: 8,
          name: "Cheddar Cheese Aged 12 Months",
          weight: "200g (1 kg = 19.95 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.99,
          originalPrice: 4.49,
          discount: "10% OFF",
        },
        {
          id: 9,
          name: "Greek Yogurt Natural 0% Fat",
          weight: "500g (1 kg = 5.98 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 2.99,
          originalPrice: 3.49,
          discount: "15% OFF",
        },
        {
          id: 10,
          name: "Mozzarella Cheese Fresh",
          weight: "125g (1 kg = 23.92 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 2.99,
          originalPrice: 3.29,
          discount: "10% OFF",
        },
        {
          id: 11,
          name: "Parmesan Cheese Grated",
          weight: "100g (1 kg = 49.90 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 4.99,
          originalPrice: 5.49,
          discount: "10% OFF",
        },
        {
          id: 12,
          name: "Whole Milk Organic 3.5% Fat",
          weight: "1L",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 1.49,
          originalPrice: 1.69,
          discount: "10% OFF",
        },
        {
          id: 13,
          name: "Cream Cheese Light Herb",
          weight: "200g (1 kg = 14.95 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 2.99,
          originalPrice: 3.29,
          discount: "10% OFF",
        },
        {
          id: 14,
          name: "Gouda Cheese Sliced",
          weight: "150g (1 kg = 19.93 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 2.99,
          originalPrice: 3.49,
          discount: "15% OFF",
        },
        {
          id: 15,
          name: "Sour Cream 18% Fat",
          weight: "200ml (1 l = 9.95 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 1.99,
          originalPrice: 2.29,
          discount: "15% OFF",
        },
      ],
    },
    {
      category: "Fruits & Vegetables",
      products: [
        {
          id: 1,
          name: "Philadelphia Cream Cheese Natural Double Cream",
          weight: "330g (1 kg = 11.48 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.79,
          originalPrice: 3.9,
          discount: "20% OFF",
        },
        {
          id: 2,
          name: "Meggle Kräuter-Tube vegan 80ml",
          weight: "80ml (1 l = 31.13 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 2.94,
          originalPrice: 3.0,
          discount: "20% OFF",
        },
        {
          id: 3,
          name: "Philadelphia Cream Cheese Natural Double Cream",
          weight: "330g (1 kg = 11.48 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.79,
          originalPrice: 3.9,
          discount: "20% OFF",
        },
        {
          id: 4,
          name: "Meggle Kräuter-Tube vegan 80ml",
          weight: "80ml (1 l = 31.13 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 2.94,
          originalPrice: 3.0,
          discount: "20% OFF",
        },
        {
          id: 5,
          name: "Philadelphia Cream Cheese Natural Double Cream",
          weight: "330g (1 kg = 11.48 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.79,
          originalPrice: 3.9,
          discount: "20% OFF",
        },
        {
          id: 6,
          name: "Organic Free Range Eggs Large",
          weight: "6 pieces (1 piece = 0.58 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.49,
          originalPrice: 3.99,
          discount: "15% OFF",
        },
        {
          id: 7,
          name: "Butter Unsalted Premium Quality",
          weight: "250g (1 kg = 15.96 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 3.99,
          originalPrice: 4.49,
          discount: "15% OFF",
        },
        {
          id: 8,
          name: "Cheddar Cheese Aged 12 Months",
          weight: "200g (1 kg = 19.95 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 3.99,
          originalPrice: 4.49,
          discount: "10% OFF",
        },
        {
          id: 9,
          name: "Greek Yogurt Natural 0% Fat",
          weight: "500g (1 kg = 5.98 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 2.99,
          originalPrice: 3.49,
          discount: "15% OFF",
        },
        {
          id: 10,
          name: "Mozzarella Cheese Fresh",
          weight: "125g (1 kg = 23.92 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 2.99,
          originalPrice: 3.29,
          discount: "10% OFF",
        },
        {
          id: 11,
          name: "Parmesan Cheese Grated",
          weight: "100g (1 kg = 49.90 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 4.99,
          originalPrice: 5.49,
          discount: "10% OFF",
        },
        {
          id: 12,
          name: "Whole Milk Organic 3.5% Fat",
          weight: "1L",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 1.49,
          originalPrice: 1.69,
          discount: "10% OFF",
        },
        {
          id: 13,
          name: "Cream Cheese Light Herb",
          weight: "200g (1 kg = 14.95 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 2.99,
          originalPrice: 3.29,
          discount: "10% OFF",
        },
        {
          id: 14,
          name: "Gouda Cheese Sliced",
          weight: "150g (1 kg = 19.93 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F06bc3389bd890f8a42c0630a1b8402d3892de966.png?alt=media&token=8bcab530-368b-47ca-805e-48b62a16e5f6",
          price: 2.99,
          originalPrice: 3.49,
          discount: "15% OFF",
        },
        {
          id: 15,
          name: "Sour Cream 18% Fat",
          weight: "200ml (1 l = 9.95 €)",
          image:
            "https://firebasestorage.googleapis.com/v0/b/simclinixe-1.firebasestorage.app/o/Test%2F18b4d9d95bc3d2ef9d1442d9da4f9f61db16bc56.png?alt=media&token=61f4f7d1-c261-4bb8-9e5e-dc1373f59a4e",
          price: 1.99,
          originalPrice: 2.29,
          discount: "15% OFF",
        },
      ],
    },
  ];

  return (
    <div className="all-categories-container">
      {CategoryProducts.map((categoryData, categoryIndex) => (
        <div key={categoryIndex} className="product-section">
          <h2 className="section-title">{categoryData.category}</h2>

          <div className="products-container">
            <div className="products-scroll">
              {categoryData.products.map((product) => (
                <div key={product.id} className="product-card">
                  {product.discount && (
                    <div className="discount-badge">{product.discount}</div>
                  )}

                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-weight">{product.weight}</p>

                    <div className="product-footer">
                      <div className="price-container">
                        <span className="current-price">
                          {product.price.toFixed(2)} €
                        </span>
                        <span className="original-price">
                          {product.originalPrice.toFixed(2)} €
                        </span>
                      </div>

                      <button className="add-to-cart">
                        <img
                          style={{
                            width: "25px",
                            height: "25px",
                          }}
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
    </div>
  );
}

export default ProductSection;
