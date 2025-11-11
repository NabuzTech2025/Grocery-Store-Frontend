// utils/productDataNormalizer.js

/**
 * Normalizes product data from different sources into a consistent format
 * Handles both raw API format and transformed format
 */
export const normalizeProductData = (product) => {
  if (!product) return null;

  // Check if it's already in the transformed format (has 'originalPrice' field)
  const isTransformed = product.hasOwnProperty("originalPrice");

  if (isTransformed) {
    // Already normalized, return as is
    return product;
  }

  // It's in raw API format, transform it
  const rawPrice = Number(product.price) || 0;
  const discountAmount = Number(product.discount_price) || 0;
  const hasDiscount = discountAmount > 0;
  const finalPrice = hasDiscount ? rawPrice - discountAmount : rawPrice;

  return {
    id: product.id,
    name: product.name,
    weight: product.item_code || "",
    description: product.description || "",
    image_url: String(product.image_url || "").split("?")[0],

    // Price fields
    price: finalPrice,
    originalPrice: rawPrice,
    discount_price: discountAmount,
    discount: hasDiscount
      ? `${Math.round((discountAmount / rawPrice) * 100)}% OFF`
      : null,

    // Category info
    category: product.category?.name || product.category || "",
    categoryId: product.category_id,

    // Tax info
    taxPercentage: product.tax?.percentage || 0,
    taxName: product.tax?.name || "",

    // Stock info
    stock:
      product.stock !== undefined && product.stock !== null
        ? Number(product.stock)
        : product.quantity !== undefined && product.quantity !== null
        ? Number(product.quantity)
        : undefined,

    quantity:
      product.quantity !== undefined && product.quantity !== null
        ? Number(product.quantity)
        : product.stock !== undefined && product.stock !== null
        ? Number(product.stock)
        : undefined,

    quantity_on_hand:
      product.quantity_on_hand !== undefined &&
      product.quantity_on_hand !== null
        ? Number(product.quantity_on_hand)
        : product.quantityOnHand !== undefined &&
          product.quantityOnHand !== null
        ? Number(product.quantityOnHand)
        : product.qty_on_hand !== undefined && product.qty_on_hand !== null
        ? Number(product.qty_on_hand)
        : undefined,

    qty_on_hand:
      product.qty_on_hand !== undefined && product.qty_on_hand !== null
        ? Number(product.qty_on_hand)
        : undefined,

    // Product type info
    type: product.type,
    isVariableProduct: product.type === "variable",
    hasVariants: product.variants && product.variants.length > 0,
    hasToppings:
      product.enriched_topping_groups &&
      product.enriched_topping_groups.length > 0,

    // Variants
    variants:
      product.variants?.map((variant) => {
        const variantOriginalPrice = Number(variant.price) || 0;
        const variantDiscountAmount = Number(variant.discount_price) || 0;
        const variantFinalPrice =
          variantDiscountAmount > 0
            ? variantOriginalPrice - variantDiscountAmount
            : variantOriginalPrice;

        return {
          id: variant.id,
          name: variant.name || variant.size || "",
          size: variant.size || variant.name || "",
          price: variantFinalPrice,
          originalPrice: variantOriginalPrice,
          discountAmount: variantDiscountAmount,
          stock:
            variant.stock !== undefined && variant.stock !== null
              ? Number(variant.stock)
              : undefined,
          quantity_on_hand:
            variant.quantity_on_hand !== undefined &&
            variant.quantity_on_hand !== null
              ? Number(variant.quantity_on_hand)
              : variant.quantityOnHand !== undefined &&
                variant.quantityOnHand !== null
              ? Number(variant.quantityOnHand)
              : variant.qty_on_hand !== undefined &&
                variant.qty_on_hand !== null
              ? Number(variant.qty_on_hand)
              : undefined,
          qty_on_hand:
            variant.qty_on_hand !== undefined && variant.qty_on_hand !== null
              ? Number(variant.qty_on_hand)
              : undefined,
          sku: variant.sku || "",
          isAvailable: variant.isAvailable !== false,
          image: variant.image_url || product.image_url || "",
        };
      }) || [],

    // Topping groups
    enrichedToppingGroups:
      product.enriched_topping_groups?.map((group) => ({
        id: group.id,
        name: group.name,
        required: group.required || false,
        minSelection: group.min_selection || 0,
        maxSelection: group.max_selection || 1,
        toppings:
          group.toppings?.map((topping) => ({
            id: topping.id,
            name: topping.name,
            price: Number(topping.price) || 0,
            isAvailable: topping.isAvailable !== false,
            image: topping.image_url || "",
          })) || [],
      })) || [],

    // Other fields
    allergyItems: product.allergy_items || product.allergyItems || [],
    ownerId: product.owner_id || product.ownerId,
    storeId: product.store_id || product.storeId,
    displayOrder: product.display_order || product.displayOrder || 0,

    // Selected variant (if exists)
    selectedVariant:
      product.variants && product.variants.length > 0
        ? {
            ...product.variants[0],
            stock:
              product.variants[0].stock !== undefined &&
              product.variants[0].stock !== null
                ? Number(product.variants[0].stock)
                : product.variants[0].quantity !== undefined &&
                  product.variants[0].quantity !== null
                ? Number(product.variants[0].quantity)
                : undefined,
            quantity_on_hand:
              product.variants[0].quantity_on_hand !== undefined &&
              product.variants[0].quantity_on_hand !== null
                ? Number(product.variants[0].quantity_on_hand)
                : product.variants[0].quantityOnHand !== undefined &&
                  product.variants[0].quantityOnHand !== null
                ? Number(product.variants[0].quantityOnHand)
                : product.variants[0].qty_on_hand !== undefined &&
                  product.variants[0].qty_on_hand !== null
                ? Number(product.variants[0].qty_on_hand)
                : undefined,
            qty_on_hand:
              product.variants[0].qty_on_hand !== undefined &&
              product.variants[0].qty_on_hand !== null
                ? Number(product.variants[0].qty_on_hand)
                : undefined,
          }
        : null,
  };
};

/**
 * Gets the actual price considering variants and discounts
 */
export const getProductActualPrice = (
  product,
  selectedSize = null,
  quantity = 1
) => {
  if (!product) return 0;

  // If a specific size/variant is selected, use variant pricing
  if (selectedSize && product.variants?.length > 0) {
    const variant = product.variants.find(
      (v) => v.name === selectedSize || v.size === selectedSize
    );
    if (variant) {
      return variant.price * quantity;
    }
  }

  // Use base product price
  return (product.price || 0) * quantity;
};

/**
 * Gets the display original price (before discount)
 */
export const getProductOriginalPrice = (product, selectedSize = null) => {
  if (!product) return 0;

  if (selectedSize && product.variants?.length > 0) {
    const variant = product.variants.find(
      (v) => v.name === selectedSize || v.size === selectedSize
    );
    if (variant) {
      return variant.originalPrice || variant.price || 0;
    }
  }

  return product.originalPrice || product.price || 0;
};

/**
 * Checks if product has a discount
 */
export const hasProductDiscount = (product, selectedSize = null) => {
  if (!product) return false;

  if (selectedSize && product.variants?.length > 0) {
    const variant = product.variants.find(
      (v) => v.name === selectedSize || v.size === selectedSize
    );
    if (variant) {
      return variant.discountAmount > 0;
    }
  }

  return product.discount_price > 0;
};
