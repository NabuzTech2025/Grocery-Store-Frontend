import React, { useState } from "react";
import { forgotPassword } from "@/api/UserServices";
import Header from "@/components/User/Header";
import { resetPassword_url } from "../../utils/common_urls";
import { useLanguage } from "../../contexts/LanguageContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");

    try {
      const payload = {
        username: email,
        url: resetPassword_url,
      };

      const res = await forgotPassword(payload);
      setMsg(res.data.msg);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header status={false} />
      <section id="register-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="user-login-area">
                <div className="login-col">
                  <div className="lgin-header">
                    <img
                      className="img-fluid"
                      src={`assets/user/img/brand-logo.svg`}
                      alt="Brand Logo"
                    />
                    <h4>{currentLanguage.forgotPassword}</h4>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <p>
                      <label htmlFor="email">
                        {currentLanguage.your_email}*
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </p>

                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {msg && <p style={{ color: "green" }}>{msg}</p>}

                    <p>
                      <button type="submit" disabled={loading}>
                        {loading
                          ? `${currentLanguage.sending}...`
                          : "Send Reset Link"}
                      </button>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;
