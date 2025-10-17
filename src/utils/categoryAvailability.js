// utils/categoryAvailability.js

/**
 * Converts time string (HH:MM:SS) to minutes since midnight
 * @param {string} timeString - Time in format "HH:MM:SS"
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Gets current day of week (0 = Sunday, 1 = Monday, etc.)
 * @param {string} serverTime - Server time in format "YYYY-MM-DD HH:MM:SS"
 * @returns {number} Day of week (0-6)
 */
export const getCurrentDayOfWeek = (serverTime) => {
  if (!serverTime) {
    return new Date().getDay();
  }

  // Parse server time format "2025-09-04 13:02:12"
  const serverDate = new Date(serverTime.replace(" ", "T"));
  return serverDate.getDay();
};

/**
 * Gets current time in minutes since midnight
 * @param {string} serverTime - Server time in format "YYYY-MM-DD HH:MM:SS"
 * @returns {number} Minutes since midnight
 */
export const getCurrentTimeInMinutes = (serverTime) => {
  if (!serverTime) {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }

  // Parse server time format "2025-09-04 13:02:12"
  const [datePart, timePart] = serverTime.split(" ");
  const [hours, minutes] = timePart.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Checks if a category is available at the current time
 * @param {Object} category - Category object with categories_availability array
 * @param {string} serverTime - Server time in format "YYYY-MM-DD HH:MM:SS"
 * @returns {boolean} True if category is available now
 */
export const isCategoryAvailable = (category, serverTime) => {
  // If no availability data, show category (default behavior)
  if (
    !category.categories_availability ||
    category.categories_availability.length === 0
  ) {
    return true;
  }

  const currentDayOfWeek = getCurrentDayOfWeek(serverTime);
  const currentTimeMinutes = getCurrentTimeInMinutes(serverTime);

  // Find availability for current day
  const todayAvailability = category.categories_availability.find(
    (availability) =>
      availability.day_of_week === currentDayOfWeek && availability.isActive
  );

  // If no availability for today, category is not available
  if (!todayAvailability) {
    return false;
  }

  const startTimeMinutes = timeToMinutes(todayAvailability.start_time);
  const endTimeMinutes = timeToMinutes(todayAvailability.end_time);

  // Check if current time is within availability window
  return (
    currentTimeMinutes >= startTimeMinutes &&
    currentTimeMinutes <= endTimeMinutes
  );
};

/**
 * Filters categories based on current availability
 * @param {Array} categories - Array of category objects
 * @param {string} serverTime - Server time in format "YYYY-MM-DD HH:MM:SS"
 * @returns {Array} Filtered array of available categories
 */
export const filterAvailableCategories = (categories, serverTime) => {
  return categories.filter((category) =>
    isCategoryAvailable(category, serverTime)
  );
};

/**
 * Gets detailed availability info for a category
 * @param {Object} category - Category object with categories_availability array
 * @param {string} serverTime - Server time in format "YYYY-MM-DD HH:MM:SS"
 * @returns {Object} Availability status info
 */
export const getCategoryAvailabilityInfo = (category, serverTime) => {
  if (
    !category.categories_availability ||
    category.categories_availability.length === 0
  ) {
    return {
      isAvailable: true,
      status: "always_available",
      message: "Available all the time",
    };
  }

  const currentDayOfWeek = getCurrentDayOfWeek(serverTime);
  const currentTimeMinutes = getCurrentTimeInMinutes(serverTime);

  const todayAvailability = category.categories_availability.find(
    (availability) =>
      availability.day_of_week === currentDayOfWeek && availability.isActive
  );

  if (!todayAvailability) {
    return {
      isAvailable: false,
      status: "not_available_today",
      message: "Not available today",
    };
  }

  const startTimeMinutes = timeToMinutes(todayAvailability.start_time);
  const endTimeMinutes = timeToMinutes(todayAvailability.end_time);

  if (currentTimeMinutes < startTimeMinutes) {
    const minutesUntilOpen = startTimeMinutes - currentTimeMinutes;
    const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
    const minsUntilOpen = minutesUntilOpen % 60;

    return {
      isAvailable: false,
      status: "opens_later_today",
      message: `Opens in ${
        hoursUntilOpen > 0 ? hoursUntilOpen + "h " : ""
      }${minsUntilOpen}min`,
      opensAt: todayAvailability.start_time,
    };
  }

  if (currentTimeMinutes <= endTimeMinutes) {
    const minutesUntilClose = endTimeMinutes - currentTimeMinutes;
    const hoursUntilClose = Math.floor(minutesUntilClose / 60);
    const minsUntilClose = minutesUntilClose % 60;

    return {
      isAvailable: true,
      status: "available_now",
      message: `Closes in ${
        hoursUntilClose > 0 ? hoursUntilClose + "h " : ""
      }${minsUntilClose}min`,
      closesAt: todayAvailability.end_time,
    };
  }

  return {
    isAvailable: false,
    status: "closed_for_today",
    message: "Closed for today",
  };
};

/**
 * Debug function to log category availability
 * @param {Array} categories - Array of categories
 * @param {string} serverTime - Server time
 */
export const debugCategoryAvailability = (categories, serverTime) => {
  console.group("🕒 Category Availability Debug");
  console.log("Server Time:", serverTime);
  console.log("Current Day of Week:", getCurrentDayOfWeek(serverTime));
  console.log("Current Time (minutes):", getCurrentTimeInMinutes(serverTime));

  categories.forEach((category) => {
    const info = getCategoryAvailabilityInfo(category, serverTime);
    console.log(
      `📂 ${category.name}:`,
      info.message,
      info.isAvailable ? "✅" : "❌"
    );

    if (category.categories_availability?.length > 0) {
      console.log(
        "   Schedule:",
        category.categories_availability.map(
          (av) =>
            `${
              ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][av.day_of_week]
            }: ${av.start_time}-${av.end_time} ${av.isActive ? "✓" : "✗"}`
        )
      );
    }
  });

  console.groupEnd();
};
