import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { userRegister } from "@/api/UserServices";
import Footer from "@/components/User/Footer";
import Header from "@/components/User/Header";
import { currentCurrency } from "../utils/helper/currency_type";
import { loginLink, payload_url } from "../utils/common_urls";
import { useLanguage } from "../contexts/LanguageContext";

const RegisterPage = () => {
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    customer_name: "",
    phone: "",
    email: "",
    type: "shipping",
    line1: "",
    area: "",
    city: "",
    zip: "",
    country: currentCurrency.name,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const messageRef = useRef(null); // 👈 Add this
  const { translations: currentLanguage } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "username") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError("Invalid email format");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 1000);
      } else {
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setMessage("");

    try {
      const addressPayload = {
        type: formData.type,
        line1: `${formData.line1}`,
        city: formData.city || "",
        zip: formData.zip,
        country: formData.country,
        phone: formData.phone,
        customer_name: formData.customer_name,
      };

      const payload = {
        username: formData.username,
        password: formData.password,
        address: addressPayload,
        url: payload_url + "login/register",
      };

      if (formData.email) {
        payload.email = formData.email;
      }

      const response = await userRegister(payload);

      setMessage(
        response.msg || "Confirmation email sent. Please check your inbox."
      );

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);

      setTimeout(() => {
        navigate("/login/register");
      }, 5000);
    } catch (err) {
      console.error("Registration error:", err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Registration failed.";
      setError(message);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header status={false} />
      {/* Registration Area */}
      <section id="register-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="registration-form">
                <h5>{currentLanguage.update_your_info}</h5>
                <form onSubmit={handleSubmit}>
                  <h6>
                    <span>
                      {currentLanguage.enter_your_details ||
                        "Enter Your Details"}
                    </span>
                  </h6>
                  <div ref={messageRef}>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {message && <p style={{ color: "green" }}>{message}</p>}
                  </div>

                  <p>
                    <label>{currentLanguage.your_email || "Email"} *</label>
                    <input
                      type="email"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      title="Please enter a valid email address"
                    />
                  </p>
                  <p>
                    <label>{currentLanguage.password || "Password"} *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  <p>
                    <label>{currentLanguage.your_name || "Your Name"} *</label>
                    <input
                      type="text"
                      name="customer_name"
                      placeholder="Your Name"
                      value={formData.customer_name}
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
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </p>

                  <h6>
                    <span>
                      {currentLanguage.enter_shipping_address ||
                        "Enter Your Shipping Address"}
                    </span>
                  </h6>
                  <p>
                    <label>
                      {currentLanguage.apartment || "Apartment / House No."} *
                    </label>
                    <input
                      type="text"
                      name="line1"
                      placeholder="Apartment / House No."
                      value={formData.line1}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  {/* <p>
                    <label>{currentLanguage.city || "City"} *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </p> */}
                  <p>
                    <label>{currentLanguage.postCode || "Zip Code"} *</label>
                    <input
                      type="text"
                      name="zip"
                      placeholder="Zip Code"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  {/* <p>
                    <label>{currentLanguage.country || "Country"} *</label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </p> */}

                  <p>
                    <button type="submit" disabled={loading}>
                      {loading
                        ? currentLanguage.loading || "Please wait..."
                        : currentLanguage.view_cart || "Submit"}
                    </button>
                  </p>
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {currentLanguage.already_have_account}{" "}
                    <a href={`${loginLink}/register`}>
                      {currentLanguage.login_here}
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RegisterPage;
