import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loginAuth } from "../api/auth";
import { useAuth } from "../auth/AuthProvider";
import Footer from "@/components/User/Footer";
import Header from "@/components/User/Header";
import {
  basePath,
  forgotPasswordLink,
  registerLink,
} from "../utils/common_urls";
import brandLogo from "../../public/assets/user/img/brand-logo.png";
import { useLanguage } from "../contexts/LanguageContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { nextpage } = useParams();

  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginAuth(email, password);
      const userData = data.data;
      if (userData?.access_token) {
        await login(userData); // ✅ Save whole object
        if (nextpage === "reset-password" || nextpage === "register") {
          navigate("/", { replace: true }); // Just navigate to root
          if (basePath) {
            window.history.replaceState(null, "", window.location.href + "/");
          }
        } else if (nextpage) {
          navigate(nextpage.startsWith("/") ? nextpage : `/${nextpage}`, {
            replace: true,
          });
        } else {
          navigate(-1);
        }
      } else {
        setError("Invalid login credentials");
      }
    } catch (err) {
      setError("Incorrect email or password");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header status={false} />

      <section
        id="register-area"
        style={{
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          <p
            className="guest-login"
            onClick={() => {
              navigate("/guest-login");
            }}
          >
            {currentLanguage.guest_login}
          </p>
        </div>
        <div style={{ marginTop: "-20px" }} className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="user-login-area">
                <div className="login-col">
                  <div className="lgin-header">
                    <img
                      className="img-fluid"
                      src={brandLogo}
                      alt="Brand Logo"
                    />
                    <h4>
                      {currentLanguage.login_or_register || "Login/Register"}
                    </h4>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <p>
                      <label htmlFor="email">
                        {currentLanguage.your_email || "Your Email"}*
                      </label>
                      <input
                        type="text"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </p>
                    <p>
                      <label htmlFor="password">
                        {currentLanguage.password || "Password"}*
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </p>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <p>
                      <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : currentLanguage.view_cart}
                      </button>
                    </p>
                  </form>

                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {currentLanguage.dont_have_account}{" "}
                    <a href={registerLink}>{currentLanguage.register_here}</a>
                  </p>
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {currentLanguage.forgotPassword}{" "}
                    <a href={forgotPasswordLink}>
                      {currentLanguage.click_here}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default LoginPage;
