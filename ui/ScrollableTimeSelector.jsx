import React, { useState, useEffect, useRef } from "react";
import { Check, Clock, X } from "lucide-react";
import { useLanguage } from "../src/contexts/LanguageContext";

const ScrollableTimeSelector = ({
  value = "",
  onChange,
  min = "08:00",
  max = "21:00",
  currentTime,
  className = "",
  isValid = true,
  interval = 15, // Time interval in minutes (default 15 minutes)
  deliveryTime = 0, // Delivery time in minutes
  orderType = "pickup", // Order type: "delivery" or "pickup"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("sofort");
  const { translations: currentLanguage } = useLanguage();

  const dropdownRef = useRef(null);
  const timeScrollRef = useRef(null);

  // Set selected time from value prop, or default to "sofort"
  useEffect(() => {
    if (value) {
      setSelectedTime(value);
    } else if (!selectedTime) {
      setSelectedTime("sofort");
      onChange("sofort");
    }
  }, [value]);

  // Parse current time to get constraints
  const getCurrentTimeConstraints = () => {
    if (!currentTime) return null;

    const currentDate = new Date(currentTime);
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    return {
      currentHour,
      currentMinute,
      currentTotalMinutes,
    };
  };

  // Parse min and max times and apply current time constraint
  // Parse min and max times and apply current time constraint
  const getTimeConstraints = () => {
    const [minHour, minMinute] = min.split(":").map(Number);
    const [maxHour, maxMinute] = max.split(":").map(Number);
    const currentConstraints = getCurrentTimeConstraints();

    let effectiveMinTotalMinutes = minHour * 60 + minMinute;
    let maxTotalMinutes = maxHour * 60 + maxMinute;

    // Handle cross-midnight times (e.g., open until 3:45 AM the next day)
    if (maxTotalMinutes < effectiveMinTotalMinutes) {
      maxTotalMinutes += 1440; // Add 24 hours (1440 minutes)
    }

    // If current time exists and is later than min time, use current time as min
    if (
      currentConstraints &&
      currentConstraints.currentTotalMinutes > effectiveMinTotalMinutes
    ) {
      effectiveMinTotalMinutes = currentConstraints.currentTotalMinutes;
    }

    return {
      minTotalMinutes: effectiveMinTotalMinutes,
      maxTotalMinutes,
    };
  };
  // Generate available time slots with "Sofort" as first option
  const getAvailableTimeSlots = () => {
    const constraints = getTimeConstraints();
    const timeSlots = ["sofort"]; // Always start with "sofort" option

    let startMinutes;

    // For delivery orders, add delivery time to the minimum time
    if (orderType === "delivery" && deliveryTime > 0) {
      // Add 15 minutes + delivery time to the minimum time
      const adjustedMinTime = constraints.minTotalMinutes + 15 + deliveryTime;
      // Round up to the next interval
      startMinutes = Math.ceil(adjustedMinTime / interval) * interval;
    } else if (orderType === "pickup") {
      // For pickup orders, add 30 minutes preparation time
      const adjustedMinTime = constraints.minTotalMinutes + 30;
      // Round up to the next interval
      startMinutes = Math.ceil(adjustedMinTime / interval) * interval;
    } else {
      // For other cases, use standard logic
      startMinutes =
        Math.ceil(constraints.minTotalMinutes / interval) * interval;
    }

    for (
      let totalMinutes = startMinutes;
      totalMinutes <= constraints.maxTotalMinutes;
      totalMinutes += interval
    ) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      // Skip if hours exceed 23 (invalid time)
      if (hours > 23) break;

      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      timeSlots.push(timeString);
    }

    return timeSlots;
  };

  const availableTimeSlots = getAvailableTimeSlots();

  // Check if a time is disabled (before current time) - "sofort" is never disabled
  const isTimeDisabled = (timeString) => {
    // "sofort" option is always available
    if (timeString === "sofort") return false;

    const currentConstraints = getCurrentTimeConstraints();
    if (!currentConstraints) return false;

    const [hour, minute] = timeString.split(":").map(Number);
    const timeToCheck = hour * 60 + minute;
    return timeToCheck < currentConstraints.currentTotalMinutes;
  };

  // Handle time selection
  const handleTimeSelect = (timeString) => {
    // Don't allow selection of disabled times
    if (isTimeDisabled(timeString)) {
      return;
    }

    setSelectedTime(timeString);
    onChange(timeString);
    setIsOpen(false);
  };

  // Clear selection - reset to "sofort" instead of empty
  const handleClearSelection = (e) => {
    e.stopPropagation();
    setSelectedTime("sofort");
    onChange("sofort");
  };

  // Scroll to selected item
  const scrollToSelectedItem = (ref, selectedValue, items) => {
    if (!ref.current || !selectedValue || !items.includes(selectedValue)) {
      return;
    }

    const selectedIndex = items.indexOf(selectedValue);
    if (selectedIndex >= 0) {
      const container = ref.current;
      const containerHeight = container.clientHeight;

      const timeItems = container.querySelectorAll(".time-item");
      if (timeItems.length === 0) return;

      const actualItemHeight = timeItems[0].offsetHeight;
      const selectedElement = timeItems[selectedIndex];

      if (selectedElement) {
        const elementTop = selectedElement.offsetTop;
        const targetScrollTop =
          elementTop - containerHeight / 2 + actualItemHeight / 2;

        const maxScrollTop = container.scrollHeight - containerHeight;
        const scrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

        container.scrollTop = scrollTop;
      }
    }
  };

  // Scroll to selected item when dropdown opens or selection changes
  useEffect(() => {
    if (isOpen && selectedTime && availableTimeSlots.length > 0) {
      const timeoutId = setTimeout(() => {
        scrollToSelectedItem(timeScrollRef, selectedTime, availableTimeSlots);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedTime && availableTimeSlots.length > 0) {
      const timeoutId = setTimeout(() => {
        scrollToSelectedItem(timeScrollRef, selectedTime, availableTimeSlots);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedTime, isOpen]);

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

  // Get min and max display times for info (excluding "sofort")
  const getDisplayConstraints = () => {
    if (availableTimeSlots.length <= 1)
      return { minDisplay: "", maxDisplay: "" };

    const timeSlots = availableTimeSlots.filter((slot) => slot !== "sofort");
    if (timeSlots.length === 0) return { minDisplay: "", maxDisplay: "" };

    const minTime = timeSlots[0];
    const maxTime = timeSlots[timeSlots.length - 1];

    return {
      minDisplay: minTime,
      maxDisplay: maxTime,
    };
  };

  const { minDisplay, maxDisplay } = getDisplayConstraints();

  return (
    <div className={`scrollable-time-selector ${className}`} ref={dropdownRef}>
      <div
        className={`time-input-display ${isOpen ? "open" : ""} ${
          !isValid ? "invalid" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`time-display-text ${
            selectedTime === "sofort" ? "sofort-selected" : ""
          }`}
        >
          {selectedTime}
        </span>
        {selectedTime && selectedTime !== "sofort" && (
          <>
            {isValid && <Check size={20} className="check-icon" />}
            <X
              size={18}
              className="clear-icon"
              onClick={handleClearSelection}
              style={{
                marginLeft: "8px",
                cursor: "pointer",
                color: "#999",
              }}
            />
          </>
        )}
        {selectedTime === "sofort" && isValid && (
          <Check size={20} className="check-icon" />
        )}
        <Clock size={20} className="clock-icon" />
      </div>

      {isOpen && (
        <div className="dropdown" style={{ zIndex: 9999 }}>
          <div className="time-picker-container">
            {/* Single Time Column */}
            <div className="time-column single-time-column">
              <div className="column-header">
                {currentLanguage.available_times}
              </div>
              <div className="time-scroll" ref={timeScrollRef}>
                {availableTimeSlots.length === 0 ? (
                  <div className="no-times-available">
                    {currentLanguage.no_available_time_slots}
                  </div>
                ) : (
                  availableTimeSlots.map((timeString) => {
                    const isDisabled = isTimeDisabled(timeString);
                    return (
                      <div
                        key={timeString}
                        className={`time-item ${
                          selectedTime === timeString ? "selected" : ""
                        } ${isDisabled ? "disabled" : ""}`}
                        onClick={() =>
                          !isDisabled && handleTimeSelect(timeString)
                        }
                        style={{
                          opacity: isDisabled ? 0.4 : 1,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          color: isDisabled ? "#ccc" : "inherit",
                        }}
                      >
                        {timeString}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="time-info">
            <i className="fas fa-info-circle time-info-icon"></i>{" "}
            <div>
              <div>
                <strong>{currentLanguage.time} : </strong> {minDisplay} -{" "}
                {maxDisplay}
              </div>
              {orderType === "delivery" && deliveryTime > 0 && (
                <div
                  style={{ fontSize: "0.9em", color: "#666", marginTop: "4px" }}
                >
                  <strong>
                    {currentLanguage.delivery_time || "Delivery time"}:{" "}
                  </strong>
                  {deliveryTime} {currentLanguage.minutes || "minutes"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollableTimeSelector;
