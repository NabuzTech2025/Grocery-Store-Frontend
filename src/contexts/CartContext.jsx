import { createContext, useContext, useEffect, useState } from "react";
import { useStoreStatus } from "./StoreStatusContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showcartButton, setShowCartButton] = useState(true);
  const [showPostCode, setShowPostCode] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const { orderType, discounts } = useStoreStatus();

  // Generate unique key for cart items
  const generateCartItemKey = (productId, variantId, extras = []) => {
    const extrasKey = extras
      .map((extra) => `${extra.id}:${extra.quantity || 1}`)
      .sort()
      .join("|");
    return `${productId}-${variantId || "base"}-${extrasKey}`;
  };

  // Load cart items from localStorage on first render
  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems");
    const storedOrderNote = localStorage.getItem("orderNote");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        // Ensure each item has a unique key
        const cartWithKeys = Array.isArray(parsedCart)
          ? parsedCart.map((item) => ({
              ...item,
              uniqueKey:
                item.uniqueKey ||
                generateCartItemKey(
                  item.id,
                  item.selectedVariant?.id,
                  item.extras
                ),
            }))
          : [];
        setCartItems(cartWithKeys);
      } catch (e) {
        setCartItems([]);
      }
    }
    if (storedOrderNote) {
      setOrderNote(storedOrderNote);
    }
    setIsInitialized(true);
  }, []);

  // Save cart items to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  // Save order note to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      if (orderNote) {
        localStorage.setItem("orderNote", orderNote);
      } else {
        localStorage.removeItem("orderNote");
      }
    }
  }, [orderNote, isInitialized]);

  useEffect(() => {
    const modalEl = document.getElementById("cartModal");
    const fetchData = () => {
      const storedOrderType = localStorage.getItem("order_type") || "delivery";

      if (storedOrderType === "pickup") {
        setDeliveryFee(0);
      } else {
        setDeliveryFee(parseFloat(localStorage.getItem("delivery_fee")) || 0);
      }
    };

    modalEl?.addEventListener("shown.bs.modal", fetchData);
    return () => {
      modalEl?.removeEventListener("shown.bs.modal", fetchData);
    };
  }, []);

  const addToCart = (product, variant = null, quantity = 1, extras = []) => {
    const uniqueKey = generateCartItemKey(product.id, variant?.id, extras);

    // First check if an identical item already exists
    const existingItem = findExistingItemByKey(uniqueKey);

    if (existingItem) {
      // Update existing item instead of adding new one
      updateItemWithExtrasByKey(uniqueKey, quantity);
    } else {
      // Add new item with unique key
      setCartItems((prevItems) => {
        const itemToAdd = {
          ...product,
          uniqueKey,
          quantity,
          extras: extras.map((extra) => ({
            ...extra,
            quantity: extra.quantity || 1,
          })),
          basePrice: variant ? variant.price || 0.0 : product.price || 0.0,
          tax: product.tax?.percentage || 0,
          selectedVariant: variant,
          displayName: variant
            ? `${product.name} (${variant.name})`
            : product.name,
          displayPrice: variant ? variant.price || 0.0 : product.price || 0.0,
        };

        return [...prevItems, itemToAdd];
      });
    }
  };

  const removeFromCart = (
    productId,
    variantId = null,
    extras = [],
    itemUniqueKey = null
  ) => {
    setCartItems((prev) => {
      if (itemUniqueKey) {
        // If we have the specific item's unique key, use it directly
        return prev.filter((item) => item.uniqueKey !== itemUniqueKey);
      } else {
        // Fallback to generating key (for backward compatibility)
        const uniqueKey = generateCartItemKey(productId, variantId, extras);
        return prev.filter((item) => item.uniqueKey !== uniqueKey);
      }
    });
  };

  const updateQuantity = (
    productId,
    variantId,
    newQuantity,
    extras = [],
    itemUniqueKey = null
  ) => {
    setCartItems((prev) => {
      return prev.map((item) => {
        if (itemUniqueKey) {
          // If we have the specific item's unique key, use it directly
          if (item.uniqueKey === itemUniqueKey) {
            return { ...item, quantity: newQuantity };
          }
        } else {
          // Fallback to generating key (for backward compatibility)
          const uniqueKey = generateCartItemKey(productId, variantId, extras);
          if (item.uniqueKey === uniqueKey) {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      });
    });
  };

  const editCartProduct = (
    originalUniqueKey,
    productId,
    variantId = null,
    quantity,
    newExtras = []
  ) => {
    setCartItems((prev) => {
      // Generate new unique key for the updated item
      const newUniqueKey = generateCartItemKey(productId, variantId, newExtras);

      // Find the item being edited
      const itemIndex = prev.findIndex(
        (item) => item.uniqueKey === originalUniqueKey
      );
      if (itemIndex === -1) return prev; // Item not found

      const itemBeingEdited = prev[itemIndex];

      // Check if an item with the new configuration already exists
      const existingItemIndex = prev.findIndex(
        (item, index) => index !== itemIndex && item.uniqueKey === newUniqueKey
      );

      if (existingItemIndex !== -1) {
        // Merge with existing item
        const existingItem = prev[existingItemIndex];
        const updatedItems = prev.filter(
          (_, index) => index !== itemIndex && index !== existingItemIndex
        );

        // Create merged item with combined quantity
        const mergedItem = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
        };

        return [...updatedItems, mergedItem];
      } else {
        // Update the item with new configuration
        const updatedItem = {
          ...itemBeingEdited,
          uniqueKey: newUniqueKey,
          quantity,
          extras: newExtras,
        };

        // Handle variant changes
        if (
          variantId &&
          variantId !== (itemBeingEdited.selectedVariant?.id || null)
        ) {
          const newVariant = selectedProduct?.variants?.find(
            (v) => v.id === variantId
          );
          if (newVariant) {
            updatedItem.selectedVariant = newVariant;
            updatedItem.displayPrice = newVariant.price;
            updatedItem.basePrice = newVariant.price;
            updatedItem.displayName = `${selectedProduct.name} (${newVariant.name})`;
          }
        } else if (!variantId && itemBeingEdited.selectedVariant) {
          // Reset to base product if removing variant
          updatedItem.selectedVariant = null;
          updatedItem.displayPrice = selectedProduct.price;
          updatedItem.basePrice = selectedProduct.price;
          updatedItem.displayName = selectedProduct.name;
        }

        return prev.map((item, index) =>
          index === itemIndex ? updatedItem : item
        );
      }
    });
  };

  // Helper function to find existing item by unique key
  const findExistingItemByKey = (uniqueKey) => {
    return cartItems.find((item) => item.uniqueKey === uniqueKey);
  };

  // New function to update both main item quantity and extras quantities using unique key
  const updateItemWithExtrasByKey = (uniqueKey, quantityIncrement = 1) => {
    setCartItems((prev) => {
      return prev.map((item) => {
        if (item.uniqueKey === uniqueKey) {
          // Update main product quantity
          const newMainQuantity = item.quantity + quantityIncrement;

          return {
            ...item,
            quantity: newMainQuantity,
          };
        }

        return item;
      });
    });
  };

  // Updated function to update both main item quantity and extras quantities
  const updateItemWithExtras = (
    productId,
    variantId = null,
    quantityIncrement = 1,
    targetExtras = []
  ) => {
    const uniqueKey = generateCartItemKey(productId, variantId, targetExtras);
    updateItemWithExtrasByKey(uniqueKey, quantityIncrement);
  };

  // function to find existing item with same product id, variant id, and extras
  const findExistingItem = (productId, variantId = null, targetExtras = []) => {
    const uniqueKey = generateCartItemKey(productId, variantId, targetExtras);
    return findExistingItemByKey(uniqueKey);
  };

  const cartTotal = {
    subtotal: cartItems.reduce((sum, item) => {
      // Calculate main product price
      const mainProductTotal = item.displayPrice * item.quantity;

      // Calculate extras total using their individual quantities
      const extrasTotal =
        item.extras?.reduce(
          (tSum, topping) => tSum + topping.price * (topping.quantity || 1),
          0
        ) || 0;

      return sum + mainProductTotal + extrasTotal * item.quantity;
    }, 0),

    itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),

    get discountAmount() {
      const discountPercent =
        orderType === "delivery"
          ? discounts.delivery.value
          : discounts.pickup.value;
      return this.subtotal * (discountPercent / 100);
    },

    get grandTotal() {
      return this.subtotal - this.discountAmount + deliveryFee;
    },
  };

  const handleAddProduct = (
    product,
    variant = null,
    quantity = 1,
    extras = []
  ) => {
    const hasVariants = product.type === "variable";
    const hasToppings =
      Array.isArray(product.enriched_topping_groups) &&
      product.enriched_topping_groups.length > 0 &&
      Array.isArray(product.enriched_topping_groups[0].toppings) &&
      product.enriched_topping_groups[0].toppings.length > 0;

    if (hasVariants) {
      setSelectedProduct(product);
      setShowVariantModal(true);
    } else if (hasToppings) {
      setSelectedProduct(product);
      setShowVariantModal(true);
    } else {
      // For simple products without toppings
      const uniqueKey = generateCartItemKey(product.id, null, []);
      const existingItem = findExistingItemByKey(uniqueKey);

      if (existingItem) {
        updateQuantity(product.id, null, existingItem.quantity + 1, []);
      } else {
        addToCart(product, null, quantity, []);
      }
    }
  };

  const updateCartItemExtras = (
    productId,
    variantId = null,
    newExtras = []
  ) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (
          item.id === productId &&
          (item.selectedVariant?.id === variantId ||
            (!item.selectedVariant && !variantId))
        ) {
          // Generate new unique key when extras change
          const newUniqueKey = generateCartItemKey(
            productId,
            variantId,
            newExtras
          );
          return {
            ...item,
            extras: newExtras,
            uniqueKey: newUniqueKey,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setOrderNote("");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("orderNote");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        editCartProduct,
        updateCartItemExtras,
        updateItemWithExtras,
        findExistingItem,
        cartTotal,
        itemCount: cartTotal.itemCount,
        handleAddProduct,
        showVariantModal,
        setShowVariantModal,
        selectedProduct,
        setSelectedProduct,
        clearCart,
        setShowEditProductModal,
        showEditProductModal,
        showPostCode,
        setShowPostCode,
        showcartButton,
        setShowCartButton,
        orderNote,
        setOrderNote,
        generateCartItemKey, // Export for use in other components
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
