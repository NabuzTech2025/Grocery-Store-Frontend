import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "@/api/UserServices";
import Header from "@/components/User/Header";
import { payload_url } from "../../utils/common_urls";
import { useLanguage } from "../../contexts/LanguageContext";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");
    if (!resetToken) {
      setError("Invalid or missing token.");
    }
    setToken(resetToken || "");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        reset_token: token,
        new_password: password,
        url: payload_url + "/login/reset-password",
      });
      setMsg(res.msg);
      setPassword("");
      setConfirmPassword("");
      navigate("/login/reset-password");
    } catch (err) {
      setError(err.response?.data?.msg || "Reset failed");
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
                    <h4>{currentLanguage.reset_password_heading}</h4>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <p>
                      <label htmlFor="password">
                        {currentLanguage.new_password_label}*
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </p>
                    <p>
                      <label htmlFor="confirm">
                        {currentLanguage.confirm_password_label}*
                      </label>
                      <input
                        type="password"
                        id="confirm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </p>

                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {msg && <p style={{ color: "green" }}>{msg}</p>}

                    <p>
                      <button type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
