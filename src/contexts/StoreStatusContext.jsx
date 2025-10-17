import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { getStoreDetails, getStorePostcodes } from "@/api/UserServices";
import { DateTime } from "luxon";
import { getStoreDisscount } from "../api/UserServices";
import { useLanguage } from "./LanguageContext";

const StoreStatusContext = createContext();
export const useStoreStatus = () => useContext(StoreStatusContext);

export const StoreStatusProvider = ({ children }) => {
  const [store, setStore] = useState(null);
  const [todayHours, setTodayHours] = useState([]);
  const [statusText, setStatusText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hoursDisplay, setHoursDisplay] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [currentTimeSlot, setCurrentTimeSlot] = useState(null);
  const [postCode, setPostCode] = useState("");
  const [postCodeData, setPostCodeData] = useState(null);
  const [allPostCodes, setAllPostCodes] = useState([]);
  const [postCodesLoading, setPostCodesLoading] = useState(false);

  // Store server time sync data
  const [serverTime, setServerTime] = useState(null);
  const [timezone, setTimezone] = useState("Europe/Berlin");
  const [isWSLoading, setIsWSLoading] = useState(false);
  const [orderType, setOrderType] = useState("delivery");
  const [discounts, setDiscounts] = useState({
    delivery: { value: 0, code: "" },
    pickup: { value: 0, code: "" },
  });
  const [discountLoading, setDiscountLoading] = useState(true);
  const { translations: currentLanguage } = useLanguage();

  const STORE_ID = import.meta.env.VITE_STORE_ID;
  const base_url = import.meta.env.VITE_API_BASE_URL;
  const wsRef = useRef(null);
  const statusIntervalRef = useRef(null);

  // Store the initial server time sync
  const initialServerTimeRef = useRef(null);
  const connectionTimeRef = useRef(null);
  const cachedHoursRef = useRef([]);
  const hasFetchedStore = useRef(false);
  const hasFetchedPostcodes = useRef(false);

  // Function to get current server time based on initial sync
  const getCurrentServerTime = useCallback(() => {
    if (!initialServerTimeRef.current || !connectionTimeRef.current) {
      return DateTime.now().setZone(timezone).toFormat("yyyy-MM-dd HH:mm:ss");
    }

    const now = DateTime.now();
    const timeDiff = now - connectionTimeRef.current;
    const currentServerTime = initialServerTimeRef.current.plus(timeDiff);

    return currentServerTime.toFormat("yyyy-MM-dd HH:mm:ss");
  }, [timezone]);

  // Function to check if store is currently open based on time slots
  const checkStoreStatus = useCallback(
    (timeSlots, currentTime) => {
      if (!timeSlots || timeSlots.length === 0) {
        return {
          isOpen: false,
          statusText: "Closed",
          hoursDisplay: "Closed today",
          currentSlot: null,
        };
      }

      // Parse current time in Berlin timezone
      let berlinTime;
      try {
        berlinTime = DateTime.fromFormat(currentTime, "yyyy-MM-dd HH:mm:ss", {
          zone: timezone,
        });

        if (!berlinTime.isValid) {
          berlinTime = DateTime.fromISO(currentTime).setZone(timezone);
        }

        if (!berlinTime.isValid) {
          berlinTime = DateTime.now().setZone(timezone);
        }
      } catch (error) {
        console.error("Error parsing time:", error);
        berlinTime = DateTime.now().setZone(timezone);
      }

      const currentTimeStr = berlinTime.toFormat("HH:mm");

      // Sort time slots by opening time
      const sortedSlots = [...timeSlots].sort((a, b) => {
        const timeA = DateTime.fromFormat(a.open_time, "HH:mm");
        const timeB = DateTime.fromFormat(b.open_time, "HH:mm");
        return timeA - timeB;
      });

      // Check each time slot to see if we're currently open
      for (const slot of sortedSlots) {
        const { open_time, close_time, label } = slot;

        const openTime = DateTime.fromFormat(open_time, "HH:mm", {
          zone: timezone,
        });
        const closeTime = DateTime.fromFormat(close_time, "HH:mm", {
          zone: timezone,
        });
        const currentDateTime = DateTime.fromFormat(currentTimeStr, "HH:mm", {
          zone: timezone,
        });

        // Handle case where close time is next day
        let adjustedCloseTime = closeTime;
        if (closeTime < openTime) {
          adjustedCloseTime = closeTime.plus({ days: 1 });
        }

        // Check if current time is within this slot
        const isInTimeSlot =
          currentDateTime >= openTime && currentDateTime < adjustedCloseTime;

        if (isInTimeSlot) {
          const labelText =
            label && label !== "morning time"
              ? ` (${label.replace(/\*\*/g, "")})`
              : "";
          return {
            isOpen: true,
            statusText: "Open",
            hoursDisplay: `${open_time} - ${close_time}`,
            currentSlot: slot,
            openTime: open_time,
            closeTime: close_time,
          };
        }
      }

      // If not in any time slot, find next opening time
      const currentTime24 = DateTime.fromFormat(currentTimeStr, "HH:mm");
      let nextSlot = null;

      for (const slot of sortedSlots) {
        const slotOpenTime = DateTime.fromFormat(slot.open_time, "HH:mm");
        if (currentTime24 < slotOpenTime) {
          nextSlot = slot;
          break;
        }
      }

      if (!nextSlot) {
        return {
          isOpen: false,
          statusText: "Closed",
          hoursDisplay: currentLanguage.closed_for_today,
          currentSlot: null,
          openTime: "",
          closeTime: "",
        };
      }

      return {
        isOpen: false,
        statusText: "Closed",
        hoursDisplay: `${currentLanguage.opens_at} ${nextSlot.open_time}`,
        currentSlot: null,
        openTime: nextSlot.open_time,
        closeTime: nextSlot.close_time,
      };
    },
    [timezone]
  );

  // Function to format hours display for multiple time slots
  const formatHoursDisplay = useCallback((timeSlots) => {
    if (!timeSlots || timeSlots.length === 0) return "Closed today";

    const sortedSlots = [...timeSlots].sort((a, b) => {
      const timeA = DateTime.fromFormat(a.open_time, "HH:mm");
      const timeB = DateTime.fromFormat(b.open_time, "HH:mm");
      return timeA - timeB;
    });

    if (sortedSlots.length === 1) {
      const slot = sortedSlots[0];
      const labelText =
        slot.label && slot.label !== "morning time"
          ? ` (${slot.label.replace(/\*\*/g, "")})`
          : "";
      return `${slot.open_time} - ${slot.close_time}${labelText}`;
    }

    return sortedSlots
      .map((slot) => {
        const labelText =
          slot.label && slot.label !== "morning time"
            ? ` (${slot.label.replace(/\*\*/g, "")})`
            : "";
        return `${slot.open_time} - ${slot.close_time}${labelText}`;
      })
      .join(" • ");
  }, []);

  // Function to update status using synced server time
  const updateStatusFromServerTime = useCallback(() => {
    if (cachedHoursRef.current.length > 0) {
      const currentTime = getCurrentServerTime();
      const status = checkStoreStatus(cachedHoursRef.current, currentTime);

      setIsOpen(status.isOpen);
      setStatusText(status.statusText);
      setHoursDisplay(status.hoursDisplay);
      setCurrentTimeSlot(status.currentSlot);

      if (status.openTime) setOpenTime(status.openTime);
      if (status.closeTime) setCloseTime(status.closeTime);
    }
  }, [checkStoreStatus, getCurrentServerTime]);

  const fetchStore = async () => {
    try {
      const response = await getStoreDetails(STORE_ID);
      setStore(response);

      const berlinNow = DateTime.now().setZone("Europe/Berlin");
      const today = berlinNow.weekday % 7;

      const hours = response.store_hours.filter(
        (slot) => slot.day_of_week === today
      );

      setTodayHours(hours);
      cachedHoursRef.current = hours;

      // Initial status check using local time (before WebSocket sync)
      if (hours.length > 0) {
        const now = berlinNow.toFormat("yyyy-MM-dd HH:mm:ss");
        const status = checkStoreStatus(hours, now);

        setIsOpen(status.isOpen);
        setStatusText(status.statusText);
        setHoursDisplay(status.hoursDisplay);
        setCurrentTimeSlot(status.currentSlot);

        if (status.openTime) setOpenTime(status.openTime);
        if (status.closeTime) setCloseTime(status.closeTime);
      }
    } catch (err) {
      console.error("Error fetching store:", err.message);
    }
  };

  // This useEffect in StoreStatusProvider to sync postCodeData with postCode changes
  useEffect(() => {
    if (postCode && allPostCodes.length > 0) {
      const matchingPostcode = allPostCodes.find(
        (p) => p.postcode === postCode
      );
      if (matchingPostcode) {
        console.log(
          "Updating postCodeData for postcode:",
          postCode,
          matchingPostcode
        );
        setPostCodeData(matchingPostcode);
      } else {
        console.warn("No matching postcode data found for:", postCode);
        setPostCodeData(null);
      }
    }
  }, [postCode, allPostCodes]);

  // Fetch postcodes function
  const fetchPostcodes = useCallback(async () => {
    if (hasFetchedPostcodes.current) return;

    try {
      setPostCodesLoading(true);
      hasFetchedPostcodes.current = true;

      const postcodesData = await getStorePostcodes(STORE_ID);
      setAllPostCodes(postcodesData);

      // Check if there's a saved postcode in localStorage
      const savedPostcode = localStorage.getItem("delivery_postcode");
      if (savedPostcode) {
        const matchingPostcode = postcodesData.find(
          (p) => p.postcode === savedPostcode
        );
        if (matchingPostcode) {
          setPostCode(savedPostcode);
          setPostCodeData(matchingPostcode);
        }
      }
    } catch (err) {
      console.error("Error fetching postcodes:", err.message);
    } finally {
      setPostCodesLoading(false);
    }
  }, [STORE_ID]);

  // Fetch store info once
  useEffect(() => {
    if (hasFetchedStore.current) return;
    hasFetchedStore.current = true;
    fetchStore();
    fetchPostcodes();
  }, [checkStoreStatus, fetchPostcodes]);

  // WebSocket logic - connects only when store is available
  useEffect(() => {
    if (!store) return;

    const connectWebSocket = () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      // Set loading state when WebSocket connects
      setIsWSLoading(true);

      const backend_Url = base_url
        ? base_url.split("//")[1]
        : "wss://magskr.com";
      console.log("backend_Url", backend_Url);
      const ws = new WebSocket(
        `wss://${backend_Url}/ws/store/${STORE_ID}/status`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            console.log("WebSocket error data:", data);
            setIsOpen(false);
            setStatusText("Closed");
            setHoursDisplay("Closed");
            setCurrentTimeSlot(null);
            return;
          }

          const { today_hours, local_time, timezone: wsTimezone } = data;

          // Store server time sync data on first message or when reconnecting
          if (local_time) {
            const newServerTime = DateTime.fromFormat(
              local_time,
              "yyyy-MM-dd HH:mm:ss",
              { zone: wsTimezone || "Europe/Berlin" }
            );

            initialServerTimeRef.current = newServerTime;
            connectionTimeRef.current = DateTime.now();
            setServerTime(local_time);

            if (wsTimezone) {
              setTimezone(wsTimezone);
            }
          }

          // Update cached hours if changed
          if (
            today_hours &&
            JSON.stringify(today_hours) !==
              JSON.stringify(cachedHoursRef.current)
          ) {
            cachedHoursRef.current = today_hours;
            setTodayHours(today_hours);
          }

          // Calculate status using received time
          if (today_hours && local_time) {
            const status = checkStoreStatus(today_hours, local_time);

            setIsOpen(status.isOpen);
            setStatusText(status.statusText);
            setHoursDisplay(status.hoursDisplay);
            setCurrentTimeSlot(status.currentSlot);

            if (status.openTime) setOpenTime(status.openTime);
            if (status.closeTime) setCloseTime(status.closeTime);
          } else {
            // Fallback
            setIsOpen(data.is_open || false);
            setStatusText(data.is_open ? "Open" : "Closed");

            if (data.today_hours && data.today_hours.length > 0) {
              setHoursDisplay(formatHoursDisplay(data.today_hours));
              const firstSlot = data.today_hours[0];
              setOpenTime(firstSlot.open_time);
              setCloseTime(firstSlot.close_time);
            } else {
              setHoursDisplay("Closed today");
            }
          }
        } catch (err) {
          console.error("WebSocket parse error:", err);
          setStatusText("Closed");
          setIsOpen(false);
          setHoursDisplay("Closed");
          setCurrentTimeSlot(null);
        } finally {
          setIsWSLoading(false);
        }
      };

      ws.onerror = (error) => {
        console.log("WebSocket error:", error);
        setIsOpen(false);
        setIsWSLoading(false);
        setStatusText("Closed");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setIsWSLoading(false);
      };
    };

    connectWebSocket();

    // Reconnect on tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab visible. Reconnecting WebSocket...");
        connectWebSocket();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Use interval with synced server time
    statusIntervalRef.current = setInterval(() => {
      updateStatusFromServerTime();
    }, 6000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [store]); // Only depend on store

  useEffect(() => {
    const storedPostcode = localStorage.getItem("delivery_postcode");
    const storedOrderType = localStorage.getItem("order_type");
    if (storedPostcode) {
      setPostCode(storedPostcode);
    }

    if (storedOrderType) {
      setOrderType(storedOrderType);
    }
  }, []);

  // Fetch discounts on component mount
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await getStoreDisscount();

        if (response.data && Array.isArray(response.data)) {
          const discountData = {
            delivery: { value: 0, code: "" },
            pickup: { value: 0, code: "" },
          };

          response.data.forEach((discount) => {
            if (discount.code === "DELIVERY_DISCOUNT") {
              discountData.delivery = {
                value: discount.value,
                code: discount.code,
              };
            } else if (discount.code === "PICKUP_DISCOUNT") {
              discountData.pickup = {
                value: discount.value,
                code: discount.code,
              };
            }
          });

          setDiscounts(discountData);
        }
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setDiscountLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  return (
    <StoreStatusContext.Provider
      value={{
        store,
        todayHours,
        statusText,
        isOpen,
        hoursDisplay,
        openTime,
        closeTime,
        currentTimeSlot,
        serverTime,
        timezone,
        isWSLoading,
        postCode,
        setPostCode,
        postCodeData,
        setPostCodeData,
        allPostCodes,
        setAllPostCodes,
        postCodesLoading,
        orderType,
        setOrderType,
        discounts,
        discountLoading,
      }}
    >
      {children}
    </StoreStatusContext.Provider>
  );
};
