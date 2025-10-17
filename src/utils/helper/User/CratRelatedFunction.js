// function to compare extras arrays regardless of order
export const extrasMatch = (extras1, extras2) => {
  if (!extras1 && !extras2) return true;
  if (!extras1 || !extras2) return false;
  if (extras1.length !== extras2.length) return false;

  // Sort both arrays by id for comparison, but exclude quantity from comparison
  const sorted1 = [...extras1]
    .map(({ quantity, ...rest }) => rest) // Remove quantity from comparison
    .sort((a, b) => a.id - b.id);

  const sorted2 = [...extras2]
    .map(({ quantity, ...rest }) => rest) // Remove quantity from comparison
    .sort((a, b) => a.id - b.id);

  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};
