const Hero = () => {
  return (
    <section id="hero-section">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 hero-col" style={{ position: "relative" }}>
            <img
              className="img-fluid"
              src={`assets/user/img/brand-banner.jpg`}
              alt="Restaurant Banner"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
