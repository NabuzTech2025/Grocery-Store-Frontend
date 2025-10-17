// Add this helper function at the top of your ProductsArea component
const sortCategoriesByDisplayOrder = (categories) => {
  if (!categories?.length) return [];

  return [...categories].sort((a, b) => {
    // Primary sort by display_order (ascending)
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }

    // Secondary sort by id when display_order is the same
    // This ensures consistent ordering for categories with same display_order
    return b.id - a.id;
  });
};

export default sortCategoriesByDisplayOrder;
