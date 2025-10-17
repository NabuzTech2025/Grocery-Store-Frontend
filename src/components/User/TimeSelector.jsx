import { DateTime } from "luxon";
import { useMemo, useState, useEffect } from "react";
import "../../../ui/css/TimeSelector.css";
import { useStoreStatus } from "../../contexts/StoreStatusContext";
import ScrollableTimeSelector from "../../../ui/ScrollableTimeSelector";
import { useLanguage } from "../../contexts/LanguageContext";
import PreorderDatePicker from "./PreorderDatePicker";
import PreorderTimeSelector from "./PreorderTimeSelector";
import { getStoreHours } from "../../api/AdminServices";
const TimeSelector = ({
  onSelectTime,
  onSelectType,
  selectedTimeErrorShow,
  setSelectedTimeErrorShow,
  postcode,
}) => {
  const [orderMode, setOrderMode] = useState("today");
  const [selectedTime, setSelectedTime] = useState("sofort");
  const [selectedDate, setSelectedDate] = useState(null);
  const [preorderTime, setPreorderTime] = useState("");
  const [storeHours, setStoreHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const StroeId = import.meta.env.VITE_STORE_ID;

  const fetchStoreHours = async () => {
    try {
      setLoading(true);
      const response = await getStoreHours(StroeId);
      setStoreHours(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching store hours:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreHours();
  }, []);

  const {
    openTime,
    closeTime,
    serverTime,
    postCodeData,
    orderType,
    todayHours,
    timezone,
  } = useStoreStatus();

  const { translations: currentLanguage } = useLanguage();

  // Check if "Today" option should be available
  const isTodayAvailable = useMemo(() => {
    if (!todayHours || todayHours.length === 0) {
      return false; // No hours for today = closed
    }

    if (!serverTime) {
      return false; // No server time available
    }

    try {
      // Parse current server time
      const currentTime = DateTime.fromFormat(
        serverTime,
        "yyyy-MM-dd HH:mm:ss",
        { zone: timezone || "Europe/Berlin" }
      );

      if (!currentTime.isValid) {
        return false;
      }

      const currentTimeStr = currentTime.toFormat("HH:mm");

      // Sort time slots by opening time
      const sortedSlots = [...todayHours].sort((a, b) => {
        const timeA = DateTime.fromFormat(a.open_time, "HH:mm");
        const timeB = DateTime.fromFormat(b.open_time, "HH:mm");
        return timeA - timeB;
      });

      // Get the last closing time of the day
      const lastSlot = sortedSlots[sortedSlots.length - 1];
      const lastCloseTime = DateTime.fromFormat(lastSlot.close_time, "HH:mm");
      const currentDateTime = DateTime.fromFormat(currentTimeStr, "HH:mm");

      // If current time is before the last closing time, "Today" is available
      if (currentDateTime < lastCloseTime) {
        return true;
      }

      // Handle case where closing time is past midnight (e.g., 02:00)
      const firstOpenTime = DateTime.fromFormat(
        sortedSlots[0].open_time,
        "HH:mm"
      );
      if (lastCloseTime < firstOpenTime) {
        return true;
      }

      return false; // Past last closing time
    } catch (error) {
      console.error("Error checking today availability:", error);
      return false;
    }
  }, [todayHours, serverTime, timezone]);

  useEffect(() => {
    onSelectType(orderMode);
  }, [orderMode]);

  const maxSelectableTime = useMemo(() => {
    if (!closeTime) return "21:00";
    const [hours, minutes] = closeTime.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes - 15;
    if (totalMinutes < 0) totalMinutes = 0;
    const maxHours = Math.floor(totalMinutes / 60);
    const maxMins = totalMinutes % 60;
    return `${maxHours.toString().padStart(2, "0")}:${maxMins
      .toString()
      .padStart(2, "0")}`;
  }, [closeTime]);

  const isTimeValid = useMemo(() => {
    if (orderMode === "today" && selectedTime === "sofort") return true;
    if (!selectedTime) return true;
    return (
      selectedTime >= (openTime || "08:00") && selectedTime <= maxSelectableTime
    );
  }, [selectedTime, openTime, maxSelectableTime, orderMode]);

  const handleTimeChange = (newTime) => {
    if (orderMode === "today") {
      setSelectedTime(newTime);
      onSelectTime(newTime);
    } else {
      setPreorderTime(newTime);
      if (selectedDate && newTime) {
        const dateTimeString = `${selectedDate}T${newTime}:00.000Z`;
        onSelectTime(dateTimeString);
      }
    }
    setSelectedTimeErrorShow(false);
  };

  const handleOrderModeChange = (mode) => {
    setOrderMode(mode);
    onSelectType(mode);

    if (mode === "today") {
      setSelectedTime("sofort");
      setSelectedDate(null);
      setPreorderTime("");
      onSelectTime("sofort");
    } else {
      setSelectedTime("");
      setSelectedDate(null);
      setPreorderTime("");
      onSelectTime("");
    }

    setSelectedTimeErrorShow(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setPreorderTime("");
    onSelectTime("");
  };

  const deliveryTime = useMemo(() => {
    if (orderType === "delivery" && postCodeData?.delivery_time) {
      return postCodeData.delivery_time;
    }
    return 0;
  }, [orderType, postCodeData]);

  return (
    <div>
      <div className="time-selector-container">
        <div className="options-list">
          {isTodayAvailable ? (
            <>
              <div
                className="option-container"
                onClick={() => handleOrderModeChange("today")}
              >
                <div className="option-content">
                  <div
                    className={`radio-button ${
                      orderMode === "today" ? "selected" : ""
                    }`}
                  >
                    {orderMode === "today" && (
                      <div className="radio-button-dot"></div>
                    )}
                  </div>
                  <span className="option-label">
                    {currentLanguage.today || "Today"}
                  </span>
                </div>
              </div>

              {/* Today Time Selector */}
              {orderMode === "today" && (
                <div className="time-input-container">
                  <ScrollableTimeSelector
                    value={selectedTime}
                    onChange={handleTimeChange}
                    min={openTime || "08:00"}
                    max={maxSelectableTime}
                    isValid={isTimeValid}
                    currentTime={serverTime}
                    deliveryTime={deliveryTime}
                    orderType={orderType}
                    className="custom-scrollable-selector"
                  />

                  {selectedTimeErrorShow && (
                    <div className="error-message">
                      {currentLanguage.select_valid_time ||
                        "Please select a valid time"}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            // Show "Closed" message when today is not available
            <div className="option-container closed-container">
              <div className="option-content">
                <div className="radio-button disabled">
                  <div className="radio-button-cross">✕</div>
                </div>
                <span className="option-label closed-label">
                  {currentLanguage.closed_for_today || "Closed for today"}
                </span>
              </div>
            </div>
          )}

          {/* Preorder Option */}
          <div
            className="option-container"
            onClick={() => handleOrderModeChange("preorder")}
            style={{ marginTop: "15px" }}
          >
            <div className="option-content">
              <div
                className={`radio-button ${
                  orderMode === "preorder" ? "selected" : ""
                }`}
              >
                {orderMode === "preorder" && (
                  <div className="radio-button-dot"></div>
                )}
              </div>
              <span className="option-label">
                {currentLanguage.preorder || "Preorder"}
              </span>
            </div>
          </div>

          {/* Preorder Date & Time Selector */}
          {orderMode === "preorder" && (
            <div
              className="preorder-container"
              style={{ marginTop: "10px", paddingLeft: "35px" }}
            >
              <div className="time-input-container">
                <PreorderDatePicker
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  currentLanguage={currentLanguage}
                />
              </div>

              {selectedDate && (
                <div className="time-input-container">
                  <PreorderTimeSelector
                    value={preorderTime}
                    onChange={handleTimeChange}
                    isValid={isTimeValid}
                    deliveryTime={deliveryTime}
                    orderType={orderType}
                    currentLanguage={currentLanguage}
                    className="custom-scrollable-selector"
                    interval={15}
                    storeHours={storeHours} // Pass store hours
                    selectedDate={selectedDate} // Pass selected date
                  />

                  {selectedTimeErrorShow && (
                    <div className="error-message">
                      {currentLanguage.select_valid_time ||
                        "Please select a valid time"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSelector;
