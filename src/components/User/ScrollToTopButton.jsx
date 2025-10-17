import { useEffect, useState } from "react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY < lastScrollY && window.scrollY > 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <span
      onClick={scrollToTop}
      className={`scroll-top-btn ${visible ? "show" : ""}`}
    >
      ↑
    </span>
  );
};

export default ScrollToTopButton;
