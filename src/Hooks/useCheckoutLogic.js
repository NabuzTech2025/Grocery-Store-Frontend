import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getDisscount,
  OrderPlace,
  getUserAddresses,
  OrderPlaceWithGustUser,
  adjustInventory,
} from "../api/UserServices";
import { getItemfromSessionStorage } from "../utils/helper/accessToken";
import { useCart } from "../contexts/CartContext";
import { payload_url } from "../utils/common_urls";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../auth/AuthProvider";
import { useCommonData } from "../contexts/CommonContext";
import { useStoreDetails } from "./useStoreDetails";

const stripePromise = loadStripe(
  "pk_test_51SQmeLRvxHgksgYLk9IoLKNNXtGYbXotycDdZDNr7c0MIzq6JZoeVZlt9zwzSW1KnOP3eAbcJnleNVlwHZRrxpxL00nLqgZdAI"
);

export const useCheckoutLogic = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { orderNote, setOrderNote } = useCart();
  const { paymentMethod, setPaymentMethod } = useCommonData();
  // State
  const [orderType, setOrderType] = useState("delivery");
  const [orderTypeCode, setOrderTypeCode] = useState(1);
  const [postcode, setPostcode] = useState("53604");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountId, setDiscountId] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedTime, setSelectedTime] = useState("sofort");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [awaitingStripePayment, setAwaitingStripePayment] = useState(false);
  const { storeDetails, isLoading, error } = useStoreDetails();

  const isGuestLogin = searchParams.get("isGuestLogin");

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const basePrice = item.selectedVariant ? item.displayPrice : item.price;
      const toppingTotal =
        item.extras?.reduce(
          (sum, t) => sum + (t.price || 0) * (t.quantity || 1),
          0
        ) || 0;
      return total + (basePrice + toppingTotal) * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = (discountPercent / 100) * subtotal;
  const servicefee = isLoading
    ? 0.0
    : paymentMethod === "stripe"
    ? storeDetails.stripe_service_fee
    : 0.0;
  const grandTotal = subtotal - discountAmount + deliveryFee + servicefee;

  // Check for Stripe redirect
  useEffect(() => {
    const checkStripeRedirect = async () => {
      const paymentIntent = searchParams.get("payment_intent");
      const redirectStatus = searchParams.get("redirect_status");
      const clientSecret = searchParams.get("payment_intent_client_secret");

      if (paymentIntent && redirectStatus === "succeeded" && clientSecret) {
        console.log("🔄 Stripe payment redirect detected...");
        setIsRedirecting(true);

        try {
          const stripe = await stripePromise;
          const { paymentIntent: pi } = await stripe.retrievePaymentIntent(
            clientSecret
          );

          if (pi && pi.status === "succeeded") {
            console.log("✅ Payment confirmed:", pi.id);
            setTimeout(() => {
              localStorage.removeItem("cartItems");
              window.location.replace(payload_url);
            }, 3000);
          } else {
            console.error("❌ Payment verification failed");
            setIsRedirecting(false);
            alert("Payment verification failed. Please contact support.");
          }
        } catch (error) {
          console.error("❌ Error verifying Stripe payment:", error);
          setIsRedirecting(false);
          alert("Error verifying payment. Please contact support.");
        }
      }
    };

    checkStripeRedirect();
  }, [searchParams]);

  // Fetch clientSecret for Stripe
  useEffect(() => {
    const fetchClientSecret = async () => {
      if (paymentMethod === "stripe" && orderId && !clientSecret) {
        try {
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/stripe/create-payment-intent?order_id=${orderId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: grandTotal,
                currency: "eur",
              }),
            }
          );
          const data = await response.json();

          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          }
        } catch (error) {
          console.error("Error fetching client secret:", error);
        }
      }
    };
    fetchClientSecret();
  }, [paymentMethod, orderId, grandTotal, clientSecret]);

  // iOS-compatible refresh detection
  useEffect(() => {
    const orderPlaced = localStorage.getItem("order_placed");
    const navigationTimestamp = localStorage.getItem("navigation_timestamp");
    const currentTime = Date.now();

    if (orderPlaced === "true" && navigationTimestamp) {
      const timeDiff = currentTime - parseInt(navigationTimestamp, 10);

      if (timeDiff < 5000) {
        setIsRedirecting(true);
        localStorage.removeItem("order_placed");
        localStorage.removeItem("navigation_timestamp");
        localStorage.removeItem("cartItems");
        window.location.replace(payload_url);
        return;
      }
    }

    localStorage.setItem("navigation_timestamp", currentTime.toString());

    const setNavigationFlag = () => {
      localStorage.setItem("navigation_timestamp", Date.now().toString());
    };

    window.addEventListener("pagehide", setNavigationFlag);
    window.addEventListener("beforeunload", setNavigationFlag);

    if (window.navigator.standalone) {
      window.addEventListener("unload", setNavigationFlag);
    }

    return () => {
      window.removeEventListener("pagehide", setNavigationFlag);
      window.removeEventListener("beforeunload", setNavigationFlag);
      window.removeEventListener("unload", setNavigationFlag);
    };
  }, []);

  // Load cart items
  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressRes = await getUserAddresses();
        setAddresses(addressRes.data[0]);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    if (orderType === "delivery") {
      fetchAddresses();
    }
  }, [orderType]);

  // Initialize order type and discount
  useEffect(() => {
    const ot = localStorage.getItem("order_type") || "delivery";
    setOrderType(ot);
    setOrderTypeCode(ot === "pickup" ? 2 : 1);

    getDisscount(import.meta.env.VITE_STORE_ID).then((ds) => {
      const code = `${ot.toUpperCase()}_DISCOUNT`;
      const d = ds.find((x) => x.code === code);
      if (d) {
        setDiscountPercent(d.value);
        setDiscountId(d.id);
      }
    });

    if (ot === "pickup") {
      setDeliveryFee(0);
    } else {
      const pc = localStorage.getItem("delivery_postcode") || "";
      const df = parseFloat(localStorage.getItem("delivery_fee")) || 0;
      setPostcode(pc);
      setDeliveryFee(df);
    }
  }, []);

  // Sync order note
  useEffect(() => {
    const handleStorageChange = () => {
      const storedNote = localStorage.getItem("orderNote") || "";
      if (storedNote !== orderNote) {
        setOrderNote(storedNote);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [orderNote, setOrderNote]);

  // Update inventory
  const updateInventoryForOrder = async (cartItems) => {
    try {
      await Promise.all(
        cartItems.map(async (item) => {
          try {
            const response = await adjustInventory({
              productId: item.id,
              variantId: item.selectedVariant?.id || null,
              delta: -item.quantity,
            });

            console.log(
              `Successfully updated inventory for product ${item.id}:`,
              response.data
            );
          } catch (error) {
            console.error(
              `Failed to update inventory for product ${item.id}:`,
              error?.response?.data || error
            );
          }
        })
      );
    } catch (error) {
      console.error("Error in batch inventory update:", error);
    }
  };

  // Place order
  const handlePlaceOrder = async (paymentDetails = null) => {
    // If we already have an orderId and this is a Stripe payment callback,
    // just update the payment status instead of creating a new order
    if (orderId && paymentMethod === "stripe" && paymentDetails) {
      setPlacing(true);
      try {
        setOrderSuccess(true);
        setAwaitingStripePayment(false);
        localStorage.setItem("order_placed", "true");
        localStorage.setItem("navigation_timestamp", Date.now().toString());
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Don't auto-redirect, let socket handle it
        // Socket will confirm order approval
      } catch (err) {
        console.error("Payment update error:", err);
        alert("Failed to update payment status");
      } finally {
        setPlacing(false);
      }
      return;
    }

    setPlacing(true);

    let delivery_time = null;

    if (selectedTime !== "" && selectedTime !== "sofort") {
      if (selectedTime.includes("T")) {
        delivery_time = selectedTime;
      } else {
        const todayDate = new Date();
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const deliveryDate = new Date(todayDate);
        deliveryDate.setHours(hours, minutes, 0, 0);

        const yyyy = deliveryDate.getFullYear();
        const mm = String(deliveryDate.getMonth() + 1).padStart(2, "0");
        const dd = String(deliveryDate.getDate()).padStart(2, "0");
        const HH = String(hours).padStart(2, "0");
        const MM = String(minutes).padStart(2, "0");

        delivery_time = `${yyyy}-${mm}-${dd}T${HH}:${MM}:00.000Z`;
      }
    }

    const guest_address = JSON.parse(
      getItemfromSessionStorage({ tokenName: "guestShippingAddress" })
    );

    const guest_shipping_address = {
      type: guest_address?.type || "shipping",
      line1: guest_address?.line1 || "",
      city: guest_address?.city || "",
      zip: guest_address?.zip || "",
      country: guest_address?.country || "",
      phone: guest_address?.phone || "",
      customer_name: guest_address?.customer_name || "",
    };

    const items = cartItems.map((item) => ({
      product_id: item.id,
      variant_id: item.selectedVariant?.id || 0,
      quantity: item.quantity,
      unit_price: item.selectedVariant ? item.displayPrice : item.price,
      note: "",
      toppings:
        item.extras?.map((t) => ({
          topping_id: t.id,
          quantity: t.quantity || 1,
        })) || [],
    }));

    let paymentStatus = "pending";
    let paymentPaidAt = null;
    let paymentTransactionId = null;

    if (paymentMethod === "online" && paymentDetails) {
      paymentStatus = "paid";
      paymentPaidAt = new Date().toISOString();
      paymentTransactionId = paymentDetails.transactionId;
    } else if (paymentMethod === "stripe" && paymentDetails) {
      paymentStatus = "paid";
      paymentPaidAt = new Date().toISOString();
      paymentTransactionId = paymentDetails.paymentIntentId;
    } else if (paymentMethod === "cash") {
      paymentStatus = "pending";
    }

    const body = {
      user_id: user?.id || 0,
      discount_id: discountId,
      note: orderNote,
      order_type: orderTypeCode,
      order_status: 1,
      approval_status: 1,
      delivery_time: delivery_time,
      store_id: import.meta.env.VITE_STORE_ID,
      guest_shipping_address:
        isGuestLogin === "true" ? guest_shipping_address : null,
      items,
      payment: {
        payment_method: paymentMethod === "online" ? "paypal" : paymentMethod,
        status: paymentStatus,
        paid_at: paymentPaidAt,
        transaction_id: paymentTransactionId,
        order_id: 0,
        amount: grandTotal,
      },
    };

    try {
      let resp;
      if (isGuestLogin === "true") {
        body.email = guest_address?.email || null;
        resp = await OrderPlaceWithGustUser(body);
      } else {
        resp = await OrderPlace(body);
      }

      if (resp && resp.data && resp.data.id) {
        await updateInventoryForOrder(cartItems);
        setOrderId(resp.data.id);

        if (paymentMethod === "stripe" && !paymentDetails) {
          setAwaitingStripePayment(true);
          setPlacing(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        setOrderSuccess(true);
        setAwaitingStripePayment(false);
        localStorage.setItem("order_placed", "true");
        localStorage.setItem("navigation_timestamp", Date.now().toString());
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Don't auto-redirect for any payment method
        // Let the OrderSuccess component handle it via socket
      }
    } catch (err) {
      console.error("OrderPlace error:", err);
      alert("Failed to place order");
    } finally {
      if (paymentMethod !== "stripe" || paymentDetails) {
        setPlacing(false);
      }
    }
  };

  const handlePostcodeSelect = (data) => {
    setPostcode(data.postcode);
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee);
    localStorage.setItem("order_type", "delivery");
    setOrderType("delivery");
  };

  return {
    // State
    orderType,
    orderTypeCode,
    postcode,
    deliveryFee,
    discountPercent,
    discountId,
    paymentMethod,
    placing,
    orderSuccess,
    orderId,
    addresses,
    cartItems,
    selectedTime,
    isRedirecting,
    clientSecret,
    awaitingStripePayment,
    isGuestLogin,
    orderNote,
    // Computed
    subtotal,
    discountAmount,
    grandTotal,
    // Functions
    setPaymentMethod,
    setSelectedTime,
    setOrderNote,
    handlePlaceOrder,
    handlePostcodeSelect,
  };
};
