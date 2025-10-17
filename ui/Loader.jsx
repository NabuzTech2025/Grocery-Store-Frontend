import React from "react";

const Loader = ({
  size = "medium",
  text = "Loading...",
  className = "",
  variant = "spinner", // spinner, dots, pulse
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "width: 1.5rem; height: 1.5rem;";
      case "large":
        return "width: 4rem; height: 4rem;";
      case "medium":
      default:
        return "width: 3rem; height: 3rem;";
    }
  };

  const renderSpinner = () => (
    <div
      className={`spinner-border text-primary ${className}`}
      role="status"
      style={{ [size]: getSizeClasses() }}
    >
      <span className="visually-hidden">{text}</span>
    </div>
  );

  const renderDots = () => (
    <div className={`d-flex align-items-center ${className}`}>
      <div className="loading-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      <style jsx>{`
        .loading-dots {
          display: inline-block;
          position: relative;
          width: 40px;
          height: 10px;
        }
        .dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #007bff;
          animation: loading-dots 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) {
          left: 0;
          animation-delay: -0.32s;
        }
        .dot:nth-child(2) {
          left: 14px;
          animation-delay: -0.16s;
        }
        .dot:nth-child(3) {
          left: 28px;
        }
        @keyframes loading-dots {
          0%,
          80%,
          100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );

  const renderPulse = () => (
    <div className={`pulse-loader ${className}`}>
      <div className="pulse-circle"></div>
      <style jsx>{`
        .pulse-loader {
          display: inline-block;
          width: 40px;
          height: 40px;
          position: relative;
        }
        .pulse-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #007bff;
          opacity: 0.6;
          animation: pulse-scale 1s infinite ease-in-out;
        }
        @keyframes pulse-scale {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      case "spinner":
      default:
        return renderSpinner();
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-3">
      {renderLoader()}
      {text !== "" && variant === "spinner" && (
        <div className="mt-2 text-muted small">{text}</div>
      )}
    </div>
  );
};

export default Loader;
