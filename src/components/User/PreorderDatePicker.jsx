import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const PreorderDatePicker = ({
  selectedDate,
  onDateSelect,
  currentLanguage,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateDisplay = (dateString) => {
    if (!dateString) return currentLanguage.select_date || "Select Date";

    // Parse the date string (YYYY-MM-DD) without timezone issues
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const isDateSelectable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    return checkDate > today && checkDate <= maxDate;
  };

  const handleDateClick = (day) => {
    // Format date as YYYY-MM-DD without timezone conversion
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const date = String(day.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${date}`;

    onDateSelect(dateString);
    setShowDatePicker(false);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  return (
    <div
      className="date-picker-wrapper"
      style={{ marginBottom: "15px", position: "relative" }}
      ref={dropdownRef}
    >
      <div
        className="date-input-display"
        onClick={() => setShowDatePicker(!showDatePicker)}
        style={{
          padding: "12px 15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#fff",
        }}
      >
        <span style={{ color: selectedDate ? "#333" : "#999" }}>
          {formatDateDisplay(selectedDate)}
        </span>
        <Calendar size={20} style={{ color: "#666" }} />
      </div>

      {showDatePicker && (
        <div
          className="calendar-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "5px",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
          }}
        >
          {/* Calendar Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <button
              onClick={() => navigateMonth(-1)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "5px",
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontWeight: "600", fontSize: "15px" }}>
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "5px",
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "5px",
              marginBottom: "10px",
            }}
          >
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#666",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "5px",
            }}
          >
            {getCalendarDays().map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isSelectable = isDateSelectable(day);

              // Format date as YYYY-MM-DD without timezone conversion
              const year = day.getFullYear();
              const month = String(day.getMonth() + 1).padStart(2, "0");
              const date = String(day.getDate()).padStart(2, "0");
              const dateString = `${year}-${month}-${date}`;

              const isSelected = selectedDate === dateString;

              return (
                <div
                  key={index}
                  onClick={() => isSelectable && handleDateClick(day)}
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    borderRadius: "6px",
                    cursor: isSelectable ? "pointer" : "not-allowed",
                    backgroundColor: isSelected
                      ? "#7acc57"
                      : isSelectable
                      ? "#fff"
                      : "#f5f5f5",
                    color: isSelected
                      ? "#fff"
                      : isCurrentMonth && isSelectable
                      ? "#333"
                      : "#ccc",
                    fontSize: "14px",
                    fontWeight: isSelected ? "600" : "400",
                    opacity: isCurrentMonth ? 1 : 0.5,
                  }}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreorderDatePicker;
