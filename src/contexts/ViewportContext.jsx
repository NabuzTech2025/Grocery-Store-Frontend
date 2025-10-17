// src/contexts/ViewportContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const ViewportContext = createContext();

export const ViewportProvider = ({ children }) => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isSmallestViewport, setIsSmallestViewport] = useState(false);
  const [isSmallViewport, setIsSmallViewport] = useState(false);
  const [isMediumViewport, setIsMediumViewport] = useState(false);
  const [isTabletViewport, setIsTabletViewport] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsSmallestViewport(width <= 340);
      setIsSmallViewport(width <= 576);
      setIsMediumViewport(width > 576 && width <= 768);
      setIsMobileViewport(width < 768);
      setIsTabletViewport(width >= 768 && width <= 1024);
      setIsDesktopViewport(width > 1024);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  return (
    <ViewportContext.Provider
      value={{
        viewportWidth,
        isSmallestViewport,
        isSmallViewport,
        isMediumViewport,
        isMobileViewport,
        isTabletViewport,
        isDesktopViewport,
      }}
    >
      {children}
    </ViewportContext.Provider>
  );
};

// Custom Hook
export const useViewport = () => useContext(ViewportContext);
