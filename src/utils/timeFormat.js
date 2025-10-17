export const formatTime12Hour = (time24) => {
  if (!time24) return "";

  let [hours, minutes] = time24.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert "0" or "12" → 12-hour format

  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};
