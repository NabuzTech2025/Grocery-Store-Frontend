import React, { useEffect, useState } from "react";
import Footer from "@/components/User/Footer";
import Header from "@/components/User/Header";
import AddressModal from "@/components/User/modals/AddressModal";
import { currentCurrency } from "../utils/helper/currency_type";
import { useNavigate } from "react-router-dom";
import { setIteminSessionStorage } from "../utils/helper/accessToken";
import { useStoreStatus } from "../contexts/StoreStatusContext";
import { loginLink, registerLink } from "../utils/common_urls";
import { useLanguage } from "../contexts/LanguageContext";

const GuestAddressPage = () => {
  const [guestShippingAddress, setGuestShippingAddress] = useState({
    type: "shipping",
    line1: "",
    city: "",
    zip: "",
    country: currentCurrency.name,
    phone: "",
    customer_name: "",
    email: "",
  });

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedPostcode, setSelectedPostcode] = useState("");

  const { postCode, setPostCode, orderType } = useStoreStatus();
  const { translations: currentLanguage } = useLanguage();
  const navigate = useNavigate();

  // Initialize postcode from context
  useEffect(() => {
    if (postCode) {
      setSelectedPostcode(postCode);
      setGuestShippingAddress((prev) => ({
        ...prev,
        zip: postCode,
      }));
    } else {
      const storedPostcode = localStorage.getItem("delivery_postcode");
      if (storedPostcode) {
        setSelectedPostcode(storedPostcode);
        setGuestShippingAddress((prev) => ({
          ...prev,
          zip: storedPostcode,
        }));
        setPostCode(storedPostcode);
      }
    }
  }, [postCode, setPostCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuestShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePostcodeSelect = (data) => {
    setSelectedPostcode(data.postcode);
    setGuestShippingAddress((prev) => ({
      ...prev,
      zip: data.postcode,
    }));

    // Store selected postcode data
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee || 0);
    setPostCode(data.postcode);
    setShowAddressModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // check if all required fields are filled
    if (
      !guestShippingAddress.customer_name ||
      !guestShippingAddress.line1 ||
      !guestShippingAddress.phone
    ) {
      alert(currentLanguage.form_fill_message);
      return;
    }

    if (orderType === "delivery" && !guestShippingAddress.zip) {
      alert(currentLanguage.form_fill_message);
      return;
    }

    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    if (storedCart.length > 0) {
      setIteminSessionStorage({
        tokenName: "guestShippingAddress",
        token: JSON.stringify(guestShippingAddress),
      });
      navigate("/checkout?isGuestLogin=true", {
        state: {
          from: "/guest-login",
        },
      });
    } else {
      alert(currentLanguage.your_cart_is_empty);
      navigate(-1);
    }
  };

  return (
    <div>
      <Header status={false} />

      <section id="register-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="registration-form">
                <h5>{currentLanguage.update_your_info}</h5>
                <form onSubmit={handleSubmit}>
                  <h6>
                    <span>
                      {currentLanguage.enter_shipping_address ||
                        "Enter Your Shipping Address"}
                    </span>
                  </h6>
                  <p>
                    <label>{currentLanguage.your_name || "Your Name"} *</label>
                    <input
                      type="text"
                      name="customer_name"
                      placeholder="Your Name"
                      value={guestShippingAddress.customer_name}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  <p>
                    <label>
                      {currentLanguage.your_phone || "Phone Number"} *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      value={guestShippingAddress.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 15) {
                          setGuestShippingAddress((prev) => ({
                            ...prev,
                            phone: value,
                          }));
                        }
                      }}
                      required
                    />
                  </p>
                  <>
                    <p>
                      <label>
                        {currentLanguage.your_email || "Your Email"}{" "}
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="example@email.com"
                        value={guestShippingAddress.email}
                        onChange={handleChange}
                      />
                    </p>
                    <p>
                      <label>
                        {currentLanguage.apartment || "Apartment / House No."} *
                      </label>
                      <input
                        type="text"
                        name="line1"
                        placeholder="Apartment / House No."
                        value={guestShippingAddress.line1}
                        onChange={handleChange}
                        required
                      />
                    </p>

                    {orderType === "delivery" && (
                      <p>
                        <label>
                          {currentLanguage.postCode || "Zip Code"} *
                        </label>
                        <div
                          onClick={() => setShowAddressModal(true)}
                          style={{
                            padding: "12px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            minHeight: "45px",
                          }}
                        >
                          <span
                            style={{
                              color: selectedPostcode ? "#000" : "#999",
                            }}
                          >
                            {selectedPostcode || "Select postcode..."}
                          </span>
                          <i className="bi bi-chevron-down"></i>
                        </div>
                        <input
                          type="hidden"
                          name="zip"
                          value={guestShippingAddress.zip}
                          required
                        />
                      </p>
                    )}
                  </>

                  <p>
                    <button type="submit">
                      {currentLanguage.view_cart || "Submit"}
                    </button>
                  </p>
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {currentLanguage.already_have_account}{" "}
                    <a href={`${loginLink}/update-address`}>
                      {currentLanguage.login_here}
                    </a>
                  </p>
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {currentLanguage.dont_have_account}{" "}
                    <a href={registerLink}>{currentLanguage.register_here}</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Address Modal for Postcode Selection */}
      <AddressModal
        show={showAddressModal}
        handleClose={() => setShowAddressModal(false)}
        onPostcodeSelect={handlePostcodeSelect}
      />
    </div>
  );
};

export default GuestAddressPage;
