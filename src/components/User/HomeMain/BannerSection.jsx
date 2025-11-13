import { useState, useEffect, useRef } from "react";
import bannerImage1 from "../../../../public/assets/user/img/banner-1.jpg";

const BannerSection = () => {
  const [isMobileViewport, setIsMobileViewport] = useState(
    window.innerWidth <= 768
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  // Desktop banners
  const desktopBanners = [
    {
      id: 1,
      image: bannerImage1,
      alt: "Banner 1",
    },
  ];

  // Mobile banners
  const mobileBanners = [
    {
      id: 1,
      image: "../../../../public/assets/user/img/mobile-banner.jpg",
      alt: "Banner 1",
    },
  ];

  // Select banners based on viewport
  const banners = isMobileViewport ? mobileBanners : desktopBanners;

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll detection
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const slideWidth = container.clientWidth;
      const currentIndex = Math.round(scrollPosition / slideWidth);
      const safeIndex = Math.max(0, Math.min(currentIndex, banners.length - 1));
      setCurrentSlide(safeIndex);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [banners.length]);

  // Reset current slide when viewport changes
  useEffect(() => {
    setCurrentSlide(0);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [isMobileViewport]);

  const scrollToSlide = (index) => {
    const container = scrollRef.current;
    if (!container) return;

    const slideWidth = container.clientWidth;
    container.scrollLeft = slideWidth * index;
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
