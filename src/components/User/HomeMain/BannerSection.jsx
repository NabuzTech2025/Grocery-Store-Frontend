import "../../../../ui/css/BannerSection.css";

const BannerSection = () => {
  return (
    <section>
      <div className="banner-container">
        {/* Main Banner - Left Side */}
        <div className="banner-main">
          <div className="banner-badge">100% Farm Fresh Food</div>
          <h2 className="banner-main-title">Fresh Organic</h2>
          <p className="banner-main-subtitle">Food For All</p>
          <div className="banner-main-price">$59.00</div>
          <button className="banner-btn">Shop Now</button>
          <div className="banner-main-image">
            <img
              src="https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop"
              alt="Organic Product"
            />
          </div>
        </div>

        {/* Right Side Grid */}
        <div className="banner-grid">
          {/* Top Banner */}
          <div className="banner-item banner-item-top">
            <h3 className="banner-item-title">
              Creamy Fruits
              <br />
              baby Jem
            </h3>
            <div className="banner-item-price">
              <span className="price-label">Only</span>
              <span className="price-value">$12.99</span>
            </div>
            <button className="banner-btn banner-btn-light">Shop Now</button>
            <div className="banner-item-image">
              <img
                src="https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=200&h=200&fit=crop"
                alt="Baby Food"
              />
            </div>
          </div>

          {/* Bottom Left Banner */}
          <div className="banner-item banner-item-bottom-left">
            <h3 className="banner-item-title-small">New Baby Diaper</h3>
            <p className="banner-item-subtitle">Low Quality Baby</p>
            <button className="banner-btn banner-btn-light">Shop Now</button>
            <div className="banner-item-image">
              <img
                src="https://images.unsplash.com/photo-1563460716037-460781a7ce5e?w=150&h=150&fit=crop"
                alt="Baby Diapers"
              />
            </div>
          </div>

          {/* Bottom Right Banner */}
          <div className="banner-item banner-item-bottom-right">
            <h3 className="banner-item-title-small">Dark wash FaceWash</h3>
            <p className="banner-item-subtitle">All Face Size</p>
            <div className="banner-discount">
              <span className="discount-value">15%</span>
              <span className="discount-label">OFF</span>
            </div>
            <button className="banner-btn banner-btn-light">Shop Now</button>
            <div className="banner-item-image">
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=150&h=150&fit=crop"
                alt="Face Wash"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
