import { useMemo, useState, useEffect, useRef } from "react";
import { Check, X, Clock } from "lucide-react";

// PreorderTimeSelector Component with Store Hours Support
const PreorderTimeSelector = ({
  value = "",
  onChange,
  className = "",
  isValid = true,
  interval = 15,
  deliveryTime = 0,
  orderType = "pickup",
  currentLanguage,
  storeHours = [],
  selectedDate = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const dropdownRef = useRef(null);
  const timeScrollRef = useRef(null);

  useEffect(() => {
    if (value) {
      setSelectedTime(value);
    }
  }, [value]);

  // Get day of week from selected date (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  const getDayOfWeek = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const jsDay = date.getDay(); // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Convert JavaScript day to API format: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    // If jsDay is 0 (Sunday), return 6, otherwise return jsDay - 1
    return jsDay === 0 ? 6 : jsDay - 1;
  };

  // Get store hours for the selected date
  const getStoreHoursForDate = () => {
    if (!selectedDate || !storeHours || storeHours.length === 0) {
      return [];
    }

    const dayOfWeek = getDayOfWeek(selectedDate);
    if (dayOfWeek === null) return [];

    // Filter store hours for the selected daya
    const dayHours = storeHours.filter(
      (hour) => hour.day_of_week === dayOfWeek
    );

    // Sort by opening time to handle multiple shifts
    return dayHours.sort((a, b) => {
      const timeA = a.opening_time.substring(0, 5);
      const timeB = b.opening_time.substring(0, 5);
      return timeA.localeCompare(timeB);
    });
  };

  // Convert time string (HH:MM:SS) to minutes
  const timeToMinutes = (timeString) => {
    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  };

  // Convert minutes to time string (HH:MM)
  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  // Generate time slots for a single shift with delivery time adjustment
  const generateSlotsForShift = (
    openingTime,
    closingTime,
    isFirstSlotOfShift
  ) => {
    const openMinutes = timeToMinutes(openingTime);
    let closeMinutes = timeToMinutes(closingTime);

    // Handle cross-midnight scenarios
    const isCrossMidnight = closeMinutes < openMinutes;
    if (isCrossMidnight) {
      closeMinutes += 1440;
    }

    const slots = [];

    // Determine the starting point for slot generation
    let effectiveStartMinutes = openMinutes;

    // For delivery orders, add delivery time to the opening time
    if (isFirstSlotOfShift && orderType === "delivery" && deliveryTime > 0) {
      effectiveStartMinutes = openMinutes + deliveryTime;
    }
    if (isFirstSlotOfShift && orderType === "pickup") {
      effectiveStartMinutes = openMinutes + 30;
    }

    // Round up to the next interval boundary
    let startMinutes = Math.ceil(effectiveStartMinutes / interval) * interval;

    // Generate slots at regular intervals from the effective start time
    for (
      let minutes = startMinutes;
      minutes <= closeMinutes - 15;
      minutes += interval
    ) {
      // Convert minutes back to time string, handling day overflow
      const timeString = minutesToTime(minutes);
      slots.push(timeString);
    }

    return slots;
  };

  // Get all available time slots for the selected date
  const getAvailableTimeSlots = () => {
    const dayHours = getStoreHoursForDate();

    if (dayHours.length === 0) {
      return [];
    }

    const allSlots = [];

    // Process each shift (store can be open multiple times per day)
    dayHours.forEach((shift, index) => {
      const openingTime = shift.opening_time.substring(0, 8); // HH:MM:SS
      const closingTime = shift.closing_time.substring(0, 8); // HH:MM:SS

      // Only apply delivery time to the very first shift (index === 0)
      const isFirstShift = index === 0;
      const shiftSlots = generateSlotsForShift(
        openingTime,
        closingTime,
        isFirstShift
      );
      allSlots.push(...shiftSlots);
    });

    // Remove duplicates
    const uniqueSlots = [...new Set(allSlots)];

    // Sort by time value, treating times after midnight as continuation
    uniqueSlots.sort((a, b) => {
      const [aHour, aMin] = a.split(":").map(Number);
      const [bHour, bMin] = b.split(":").map(Number);

      let aMinutes = aHour * 60 + aMin;
      let bMinutes = bHour * 60 + bMin;

      // Get first shift to determine if we're crossing midnight
      const firstShift = dayHours[0];
      const openingHour = parseInt(firstShift.opening_time.substring(0, 2), 10);
      const closingHour = parseInt(firstShift.closing_time.substring(0, 2), 10);

      // Check if schedule crosses midnight
      const crossesMidnight = closingHour < openingHour;

      if (crossesMidnight) {
        // If time is before closing hour (early morning), add 24 hours for sorting
        if (aHour < openingHour) aMinutes += 1440;
        if (bHour < openingHour) bMinutes += 1440;
      }

      return aMinutes - bMinutes;
    });

    return uniqueSlots;
  };

  const availableTimeSlots = getAvailableTimeSlots();

  console.log("Store hours =========>", storeHours),
    console.log("Selected Date ========>", selectedDate);
  console.log("Available Time Slots =========>", availableTimeSlots);

  const handleTimeSelect = (timeString) => {
    setSelectedTime(timeString);
    onChange(timeString);
    setIsOpen(false);
  };

  const handleClearSelection = (e) => {
    e.stopPropagation();
    setSelectedTime("");
    onChange("");
  };

  const scrollToSelectedItem = (ref, selectedValue, items) => {
    if (!ref.current || !selectedValue || !items.includes(selectedValue))
      return;
    const selectedIndex = items.indexOf(selectedValue);
    if (selectedIndex >= 0) {
      const container = ref.current;
      const timeItems = container.querySelectorAll(".time-item");
      if (timeItems.length === 0) return;
      const actualItemHeight = timeItems[0].offsetHeight;
      const selectedElement = timeItems[selectedIndex];
      if (selectedElement) {
        const elementTop = selectedElement.offsetTop;
        const containerHeight = container.clientHeight;
        const targetScrollTop =
          elementTop - containerHeight / 2 + actualItemHeight / 2;
        const maxScrollTop = container.scrollHeight - containerHeight;
        container.scrollTop = Math.max(
          0,
          Math.min(targetScrollTop, maxScrollTop)
        );
      }
    }
  };

  useEffect(() => {
    if (isOpen && selectedTime && availableTimeSlots.length > 0) {
      const timeoutId = setTimeout(() => {
        scrollToSelectedItem(timeScrollRef, selectedTime, availableTimeSlots);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, selectedTime]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get display info for store hours
  const getStoreHoursDisplay = () => {
    const dayHours = getStoreHoursForDate();
    if (dayHours.length === 0) return { display: "Closed", shifts: [] };

    const shifts = dayHours.map((shift) => ({
      open: shift.opening_time.substring(0, 5),
      close: shift.closing_time.substring(0, 5),
      name: shift.name,
    }));

    return { display: "Open", shifts };
  };

  const storeHoursInfo = getStoreHoursDisplay();
  const minDisplay = availableTimeSlots.length > 0 ? availableTimeSlots[0] : "";
  const maxDisplay =
    availableTimeSlots.length > 0
      ? availableTimeSlots[availableTimeSlots.length - 1]
      : "";

  return (
    <div className={`scrollable-time-selector ${className}`} ref={dropdownRef}>
      <div
        className={`time-input-display ${isOpen ? "open" : ""} ${
          !isValid ? "invalid" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="time-display-text">
          {selectedTime || currentLanguage.select_time || "Select Time"}
        </span>
        {selectedTime && (
          <>
            {isValid && <Check size={20} className="check-icon" />}
            <X
              size={18}
              className="clear-icon"
              onClick={handleClearSelection}
              style={{ marginLeft: "8px", cursor: "pointer", color: "#999" }}
            />
          </>
        )}
        <Clock size={20} className="clock-icon" />
      </div>

      {isOpen && (
        <div className="dropdown" style={{ zIndex: 9999 }}>
          <div className="time-picker-container">
            <div className="time-column single-time-column">
              <div className="column-header">
                {currentLanguage.available_times || "Available Times"}
              </div>
              <div className="time-scroll" ref={timeScrollRef}>
                {availableTimeSlots.length === 0 ? (
                  <div className="no-times-available">
                    {storeHoursInfo.display === "Closed"
                      ? currentLanguage.store_closed ||
                        "Store is closed on this day"
                      : currentLanguage.no_available_time_slots ||
                        "No available time slots"}
                  </div>
                ) : (
                  availableTimeSlots.map((timeString) => (
                    <div
                      key={timeString}
                      className={`time-item ${
                        selectedTime === timeString ? "selected" : ""
                      }`}
                      onClick={() => handleTimeSelect(timeString)}
                    >
                      {timeString}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="time-info">
            <i className="fas fa-info-circle time-info-icon"></i>
            <div>
              {availableTimeSlots.length > 0 && (
                <div>
                  <strong>
                    {currentLanguage.available_slots || "Available Slots"}:{" "}
                  </strong>
                  {minDisplay} - {maxDisplay}
                </div>
              )}
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

export default PreorderTimeSelector;
