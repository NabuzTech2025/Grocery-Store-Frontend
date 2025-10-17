import React, { useState, useEffect, useRef } from "react";
import { Check, Clock, X } from "lucide-react";

const ClockTimeSelector = ({
  value = "",
  onChange,
  min = "08:00",
  max = "21:00",
  className = "",
  isValid = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("AM");
  const [mode, setMode] = useState("hour");
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'hour' or 'minute'

  const dropdownRef = useRef(null);
  const clockRef = useRef(null);

  // Convert time string to hour and minute
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(":").map(Number);
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedPeriod(hour >= 12 ? "PM" : "AM");
    }
  }, [value]);

  // Format time for display
  const formatTime = (hour, minute) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDisplayTime = (hour, minute) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  // Calculate angle from center to mouse position
  const calculateAngle = (centerX, centerY, mouseX, mouseY) => {
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    let degrees = (angle * 180) / Math.PI + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  };

  // Get clock center coordinates
  const getClockCenter = () => {
    if (!clockRef.current) return { x: 0, y: 0 };
    const rect = clockRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  // Handle mouse/touch events for dragging
  const handlePointerDown = (e, type) => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setMode(type);

    // Add event listeners for mouse move and up
    document.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("mouseup", handlePointerUp);
    document.addEventListener("touchmove", handlePointerMove);
    document.addEventListener("touchend", handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !clockRef.current) return;

    e.preventDefault();
    const center = getClockCenter();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

    if (!clientX || !clientY) return;

    const angle = calculateAngle(center.x, center.y, clientX, clientY);

    if (dragType === "hour") {
      // Convert angle to hour (12 positions)
      let hour = Math.round(angle / 30) % 12;
      if (hour === 0) hour = 12;

      // Convert to 24-hour format based on current period
      let actualHour = hour;
      if (selectedPeriod === "PM" && hour !== 12) {
        actualHour = hour + 12;
      } else if (selectedPeriod === "AM" && hour === 12) {
        actualHour = 0;
      }

      if (actualHour !== selectedHour) {
        setSelectedHour(actualHour);
        const timeValue = formatTime(actualHour, selectedMinute);
        onChange(timeValue);
      }
    } else if (dragType === "minute") {
      // Convert angle to minute (60 positions - allow any minute value)
      let minute = Math.round(angle / 6) % 60;
      if (minute < 0) minute += 60;

      if (minute !== selectedMinute) {
        setSelectedMinute(minute);
        const timeValue = formatTime(selectedHour, minute);
        onChange(timeValue);
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragType(null);

    // Remove event listeners
    document.removeEventListener("mousemove", handlePointerMove);
    document.removeEventListener("mouseup", handlePointerUp);
    document.removeEventListener("touchmove", handlePointerMove);
    document.removeEventListener("touchend", handlePointerUp);
  };

  // Handle number click
  const handleNumberClick = (number) => {
    if (mode === "hour") {
      handleHourSelect(number);
    } else {
      handleMinuteSelect(number);
    }
  };

  // Handle hour selection
  const handleHourSelect = (displayHour) => {
    let actualHour = displayHour;
    if (selectedPeriod === "PM" && displayHour !== 12) {
      actualHour = displayHour + 12;
    } else if (selectedPeriod === "AM" && displayHour === 12) {
      actualHour = 0;
    }
    setSelectedHour(actualHour);

    const timeValue = formatTime(actualHour, selectedMinute);
    onChange(timeValue);
  };

  // Handle minute selection
  const handleMinuteSelect = (minute) => {
    setSelectedMinute(minute);
    const timeValue = formatTime(selectedHour, minute);
    onChange(timeValue);
  };

  // Handle AM/PM selection
  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    let newHour = selectedHour;

    if (period === "PM" && selectedHour < 12) {
      newHour = selectedHour + 12;
    } else if (period === "AM" && selectedHour >= 12) {
      newHour = selectedHour - 12;
    }

    setSelectedHour(newHour);
    const timeValue = formatTime(newHour, selectedMinute);
    onChange(timeValue);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Create clock face positions
  const getClockPosition = (number, isMinute = false) => {
    let angle;
    if (isMinute) {
      angle = number * 6 - 90;
    } else {
      angle = number * 30 - 90;
    }

    const radian = (angle * Math.PI) / 180;
    const radius = 45;
    const x = 50 + radius * Math.cos(radian);
    const y = 50 + radius * Math.sin(radian);
    return { x: `${x}%`, y: `${y}%` };
  };

  // Generate minute options (0, 5, 10, 15, etc.)
  const generateMinuteOptions = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += 5) {
      minutes.push(i);
    }
    return minutes;
  };

  const minuteOptions = generateMinuteOptions();

  return (
    <div className={`clock-time-selector ${className}`} ref={dropdownRef}>
      <style jsx>{`
        .clock-time-selector {
          position: relative;
          width: 100%;
        }

        .time-input-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
          min-height: 48px;
        }

        .time-input-display:hover {
          border-color: #c1c7cd;
        }

        .time-input-display.open {
          border-color: #0c831f;
          box-shadow: 0 0 0 3px rgba(12, 131, 31, 0.1);
        }

        .time-input-display.invalid {
          border-color: #dc2626;
        }

        .time-display-text {
          flex: 1;
          color: #374151;
          font-weight: 500;
        }

        .time-display-text.placeholder {
          color: #9ca3af;
        }

        .clock-icon {
          color: #6b7280;
        }

        .check-icon {
          color: #0c831f;
        }

        .dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 1000;
          background: white;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          margin-top: 4px;
          padding: 20px;
          max-height: 500px;
          overflow-y: auto;
        }

        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .controls-row {
          display: flex;
          gap: 16px;
          margin: 16px 0;
          justify-content: center;
          align-items: center;
        }

        .mode-selector {
          display: flex;
          gap: 8px;
        }

        .mode-button {
          padding: 8px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .mode-button.active {
          background: #0c831f;
          color: white;
          border-color: #0c831f;
        }

        .mode-button:hover:not(.active) {
          background: #f8fafc;
          border-color: #0c831f;
        }

        .period-selector {
          display: flex;
          gap: 8px;
        }

        .period-button {
          padding: 8px 20px;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .period-button.active {
          background: #0c831f;
          color: white;
          border-color: #0c831f;
        }

        .period-button:hover:not(.active) {
          background: #f8fafc;
          border-color: #0c831f;
        }

        .clock-container {
          position: relative;
          width: 250px;
          height: 250px;
          margin: 0 auto;
          border: 3px solid #e1e5e9;
          border-radius: 50%;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          user-select: none;
          touch-action: none;
        }

        .clock-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12px;
          height: 12px;
          background: #0c831f;
          border: 3px solid white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .clock-number {
          position: absolute;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
          color: #4b5563;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s ease;
          transform: translate(-50%, -50%);
          z-index: 5;
        }

        .clock-number:hover {
          background: #f3f4f6;
          transform: translate(-50%, -50%) scale(1.1);
        }

        .clock-number.selected {
          background: #0c831f;
          color: white;
          transform: translate(-50%, -50%) scale(1.2);
          box-shadow: 0 2px 8px rgba(12, 131, 31, 0.3);
        }

        .clock-hand {
          position: absolute;
          top: 50%;
          left: 50%;
          background: #0c831f;
          border-radius: 2px;
          transform-origin: bottom center;
          transform: translate(-50%, -100%);
          transition: transform 0.2s ease;
          z-index: 8;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .clock-hand.hour-hand {
          width: 4px;
          height: 28%;
          cursor: grab;
        }

        .clock-hand.minute-hand {
          width: 2px;
          height: 38%;
          cursor: grab;
        }

        .clock-hand:active {
          cursor: grabbing;
        }

        .clock-hand.dragging {
          cursor: grabbing;
          z-index: 9;
        }

        .hand-knob {
          position: absolute;
          width: 16px;
          height: 16px;
          background: #0c831f;
          border: 2px solid white;
          border-radius: 50%;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          cursor: grab;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          z-index: 9;
        }

        .hand-knob:active {
          cursor: grabbing;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          text-align: center;
        }

        .selected-time {
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          color: #0c831f;
          margin-bottom: 16px;
          padding: 8px;
          background: #f0f9ff;
          border-radius: 8px;
        }

        .dragging-hint {
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
          opacity: 0.8;
        }

        .minute-markers {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .minute-marker {
          position: absolute;
          width: 2px;
          height: 6px;
          background: #cbd5e1;
          left: 50%;
          transform-origin: bottom center;
          transform: translateX(-50%);
        }

        .minute-marker.major {
          height: 10px;
          background: #94a3b8;
          width: 3px;
        }
      `}</style>

      <div
        className={`time-input-display ${isOpen ? "open" : ""} ${
          !isValid ? "invalid" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`time-display-text ${!value ? "placeholder" : ""}`}>
          {value
            ? formatDisplayTime(selectedHour, selectedMinute)
            : "Select time"}
        </span>
        {value && isValid && <Check size={20} className="check-icon" />}
        <Clock size={20} className="clock-icon" />
      </div>

      {isOpen && (
        <div className="dropdown">
          <div className="dropdown-header">
            <div className="section-title">Select Time</div>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="clock-container" ref={clockRef}>
            {/* Minute markers */}
            <div className="minute-markers">
              {Array.from({ length: 60 }, (_, i) => (
                <div
                  key={i}
                  className={`minute-marker ${i % 5 === 0 ? "major" : ""}`}
                  style={{ transform: `translateX(-50%) rotate(${i * 6}deg)` }}
                />
              ))}
            </div>

            {/* Clock numbers */}
            {mode === "hour"
              ? Array.from({ length: 12 }, (_, i) => {
                  const hour = i === 0 ? 12 : i;
                  const pos = getClockPosition(hour);
                  const currentDisplayHour =
                    selectedHour === 0
                      ? 12
                      : selectedHour > 12
                      ? selectedHour - 12
                      : selectedHour;
                  const isSelected = currentDisplayHour === hour;

                  return (
                    <div
                      key={hour}
                      className={`clock-number ${isSelected ? "selected" : ""}`}
                      style={{ left: pos.x, top: pos.y }}
                      onClick={() => handleNumberClick(hour)}
                    >
                      {hour}
                    </div>
                  );
                })
              : Array.from({ length: 12 }, (_, i) => {
                  const minute = i * 5;
                  const pos = getClockPosition(minute, true);
                  const isSelected = Math.floor(selectedMinute / 5) === i;
                  const displayMinute =
                    minute === 0 ? "00" : minute.toString().padStart(2, "0");

                  return (
                    <div
                      key={minute}
                      className={`clock-number ${isSelected ? "selected" : ""}`}
                      style={{ left: pos.x, top: pos.y }}
                      onClick={() => handleNumberClick(minute)}
                    >
                      {displayMinute}
                    </div>
                  );
                })}

            {/* Hour Hand */}
            <div
              className={`clock-hand hour-hand ${
                isDragging && dragType === "hour" ? "dragging" : ""
              }`}
              style={{
                transform: `translate(-50%, -100%) rotate(${
                  (selectedHour % 12) * 30 + selectedMinute * 0.5
                }deg)`,
              }}
              onMouseDown={(e) => handlePointerDown(e, "hour")}
              onTouchStart={(e) => handlePointerDown(e, "hour")}
            >
              <div
                className="hand-knob"
                onMouseDown={(e) => handlePointerDown(e, "hour")}
                onTouchStart={(e) => handlePointerDown(e, "hour")}
              />
            </div>

            {/* Minute Hand */}
            <div
              className={`clock-hand minute-hand ${
                isDragging && dragType === "minute" ? "dragging" : ""
              }`}
              style={{
                transform: `translate(-50%, -100%) rotate(${
                  selectedMinute * 6
                }deg)`,
              }}
              onMouseDown={(e) => handlePointerDown(e, "minute")}
              onTouchStart={(e) => handlePointerDown(e, "minute")}
            >
              <div
                className="hand-knob"
                onMouseDown={(e) => handlePointerDown(e, "minute")}
                onTouchStart={(e) => handlePointerDown(e, "minute")}
              />
            </div>

            <div className="clock-center" />
          </div>

          <div className="dragging-hint">
            Drag the clock hands or click numbers to set time
          </div>

          <div className="controls-row">
            <div className="period-selector">
              <button
                className={`period-button ${
                  selectedPeriod === "AM" ? "active" : ""
                }`}
                onClick={() => handlePeriodSelect("AM")}
              >
                AM
              </button>
              <button
                className={`period-button ${
                  selectedPeriod === "PM" ? "active" : ""
                }`}
                onClick={() => handlePeriodSelect("PM")}
              >
                PM
              </button>
            </div>

            <div className="mode-selector">
              <button
                className={`mode-button ${mode === "hour" ? "active" : ""}`}
                onClick={() => setMode("hour")}
              >
                Hour
              </button>
              <button
                className={`mode-button ${mode === "minute" ? "active" : ""}`}
                onClick={() => setMode("minute")}
              >
                Minute
              </button>
            </div>
          </div>

          {value && (
            <div className="selected-time">
              {formatDisplayTime(selectedHour, selectedMinute)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClockTimeSelector;
