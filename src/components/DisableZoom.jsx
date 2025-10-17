// src/components/DisableZoom.js
import { useEffect } from "react";
import { useViewport } from "../contexts/ViewportContext";

const DisableZoom = () => {
  const { isMobileViewport } = useViewport();
  useEffect(() => {
    if (isMobileViewport) {
      const preventZoom = (e) => {
        if (
          e.ctrlKey &&
          (e.key === "+" ||
            e.key === "-" ||
            e.key === "=" ||
            e.type === "wheel")
        ) {
          e.preventDefault();
        }
      };

      window.addEventListener("keydown", preventZoom, { passive: false });
      window.addEventListener("wheel", preventZoom, { passive: false });

      return () => {
        window.removeEventListener("keydown", preventZoom);
        window.removeEventListener("wheel", preventZoom);
      };
    }
  }, []);

  return null;
};

export default DisableZoom;
