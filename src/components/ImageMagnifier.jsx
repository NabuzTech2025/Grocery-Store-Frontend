import React, { useState } from "react";
import { useViewport } from "../contexts/ViewportContext";

const ImageMagnifier = ({
  src,
  alt,
  className = "",
  style = {},
  magnifierSize = 100,
  zoomLevel = 2,
  showLens = true,
  lensColor = "#007bff",
  lensOpacity = 0.1,
  onError,
}) => {
  const { isMobileViewport } = useViewport();
  const [lensPosition, setLensPosition] = useState({
    x: 0,
    y: 0,
    visible: false,
  });
  const [isHovering, setIsHovering] = useState(false);

  // Generate unique ID for this magnifier instance
  const magnifierId = React.useMemo(
    () => `magnifier-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const handleMouseMove = (e) => {
    if (isMobileViewport) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Constrain lens within image bounds
    const constrainedX = Math.max(
      0,
      Math.min(x - magnifierSize / 2, rect.width - magnifierSize)
    );
    const constrainedY = Math.max(
      0,
      Math.min(y - magnifierSize / 2, rect.height - magnifierSize)
    );

    // Update lens position
    setLensPosition({
      x: constrainedX,
      y: constrainedY,
      visible: true,
    });

    // Update zoomed view with live tracking
    const zoomedView = document.getElementById(`zoomed-view-${magnifierId}`);
    if (zoomedView) {
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      zoomedView.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
      zoomedView.style.display = "block";
      zoomedView.style.opacity = "1";
    }
  };

  const handleTouchMove = (e) => {
    if (isMobileViewport) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Constrain lens within image bounds
    const constrainedX = Math.max(
      0,
      Math.min(x - magnifierSize / 2, rect.width - magnifierSize)
    );
    const constrainedY = Math.max(
      0,
      Math.min(y - magnifierSize / 2, rect.height - magnifierSize)
    );

    // Update lens position
    setLensPosition({
      x: constrainedX,
      y: constrainedY,
      visible: true,
    });

    // Update zoomed view with live tracking
    const zoomedView = document.getElementById(`zoomed-view-${magnifierId}`);
    if (zoomedView) {
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      zoomedView.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
      zoomedView.style.display = "block";
      zoomedView.style.opacity = "1";
    }
  };

  const handleMouseEnter = () => {
    if (isMobileViewport) return;

    setIsHovering(true);
    const zoomedView = document.getElementById(`zoomed-view-${magnifierId}`);
    if (zoomedView) {
      zoomedView.style.display = "block";
      zoomedView.style.opacity = "1";
    }
  };

  const handleTouchStart = () => {
    if (isMobileViewport) return;

    setIsHovering(true);
    const zoomedView = document.getElementById(`zoomed-view-${magnifierId}`);
    if (zoomedView) {
      zoomedView.style.display = "block";
      zoomedView.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    if (isMobileViewport) return;

    setIsHovering(false);
    const zoomedView = document.getElementById(`zoomed-view-${magnifierId}`);
    if (zoomedView) {
      zoomedView.style.display = "none";
      zoomedView.style.opacity = "0";
    }
    setLensPosition({ x: 0, y: 0, visible: false });
  };

  const handleTouchEnd = () => {
    if (isMobileViewport) return;

    setIsHovering(false);
    const zoomedView = document.getElementById(`zoomed-view-${magnifierId}`);
    if (zoomedView) {
      zoomedView.style.display = "none";
      zoomedView.style.opacity = "0";
    }
    setLensPosition({ x: 0, y: 0, visible: false });
  };

  console.log("SRC==========>", src);

  return (
    <div
      className="image-magnifier-container"
      style={{ position: "relative", display: "inline-block" }}
    >
      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        className={`img-fluid ${className}`}
        style={{
          cursor: "zoom-in",
          ...style,
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onMouseLeave={handleMouseLeave}
        onTouchEnd={handleTouchEnd}
        onError={onError}
      />

      {/* Blue Transparent Dotted Lens */}
      {lensPosition.visible && showLens && (
        <div
          style={{
            position: "absolute",
            left: `${lensPosition.x}px`,
            top: `${lensPosition.y}px`,
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            border: `2px dashed ${lensColor}`,
            backgroundColor: `rgba(0, 123, 255, ${lensOpacity})`,
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 999,
            transition: "all 0.05s ease-out",
            boxShadow: `0 0 10px ${lensColor}30`,
          }}
        />
      )}

      {/* Zoomed View */}
      <div
        id={`zoomed-view-${magnifierId}`}
        style={{
          position: "absolute",
          top: "0",
          right: window.innerWidth <= 768 ? "-200px" : "-450px",
          width: window.innerWidth <= 768 ? "200px" : "400px",
          height: window.innerWidth <= 768 ? "200px" : "400px",
          backgroundImage: `url(${src})`,
          backgroundSize:
            window.innerWidth <= 768
              ? `${400 * zoomLevel}px ${400 * zoomLevel}px`
              : `${800 * zoomLevel}px ${800 * zoomLevel}px`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0% 0%",
          borderRadius: "8px",
          border: `2px solid ${lensColor}`,
          display: "none",
          opacity: "0",
          zIndex: 1000,
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          transition: "opacity 0.2s ease-out",
        }}
      />
    </div>
  );
};

export default ImageMagnifier;
