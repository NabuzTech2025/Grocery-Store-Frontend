import { useState, useEffect, useRef } from "react";
import { useViewport } from "../../../contexts/ViewportContext";

const BannerSection = () => {
  const { isMobileViewport } = useViewport();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  const banners = [
    {
      id: 1,
      image: "../../../../public/assets/user/img/banner-1.jpg",
      alt: "Banner 1",
    },
  ];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const slideWidth = container.clientWidth; // Use clientWidth instead of offsetWidth
      const currentIndex = Math.round(scrollPosition / slideWidth);
      // Add bounds checking
      const safeIndex = Math.max(0, Math.min(currentIndex, banners.length - 1));
      setCurrentSlide(safeIndex);
    };

    // Attach event listener
    container.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [banners.length]); // Add banners.length as dependency

  const scrollToSlide = (index) => {
    const container = scrollRef.current;
    if (!container) return;

    const slideWidth = container.clientWidth;

    // Optionally set state immediately for instant feedback
    setCurrentSlide(index);
  };

  return (
    <section className="banner-section">
      <div className="banner-carousel" ref={scrollRef}>
        {banners.map((banner) => (
          <div key={banner.id} className="banner-slide">
            <img src={banner.image} alt={banner.alt} className="banner-image" />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="banner-pagination">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              className={`pagination-dot ${
                currentSlide === index ? "active" : ""
              }`}
              onClick={() => scrollToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BannerSection;
