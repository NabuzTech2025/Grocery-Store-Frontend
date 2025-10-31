import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { loginAuth } from "../../../api/auth";
import { useAuth } from "@/auth/AuthProvider"; // ✅ import auth
import {
  forgotPasswordLink,
  payload_url,
  registerLink,
} from "../../../utils/common_urls";

import close_icon from "../../../../public/assets/user/img/close-icon.svg";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

const LoginModal = ({ show, handleClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    language,
    translations: currentLanguage,
    changeLanguage,
  } = useLanguage();

  const { login } = useAuth(); // ✅ use login from context

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await loginAuth(email, password);
      const userData = data.data;
      if (userData?.access_token) {
        await login(userData); // ✅ Store full response as one object
        // i don't want to use this window.location.reload() but. i need to use for some reason
        window.location.replace(payload_url);
        handleClose();
      } else {
        setErrorMsg(data.message || "Invalid credentials");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="centre-modal-popup login-modal-col"
      centered
    >
      <Modal.Header>
        <button type="button" className="btn-close" onClick={handleClose}>
          <img src={close_icon} alt="Close" />
        </button>
      </Modal.Header>

      <Modal.Body>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "0px",
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
        <div className="login-area">
          <h3>{currentLanguage.login_or_register}</h3>
          <form onSubmit={handleLogin}>
            <p>
              <input
                type="text"
                placeholder={currentLanguage.your_email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <i className="bi bi-person-fill"></i>
            </p>
            <p>
              <input
                type="password"
                placeholder={currentLanguage.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <i className="bi bi-eye-fill"></i>
            </p>

            {errorMsg && (
              <p
                style={{
                  color: "red",
                  marginTop: "-10px",
                  marginBottom: "10px",
                }}
              >
                {errorMsg}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : currentLanguage.submit}
            </button>
          </form>
          {/* <p
            onClick={() => {
              navigate("/guest-login");
            }}
            style={{
              textAlign: "center",
              marginTop: "15px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderRadius: "5px",
              paddingTop: "10px",
              paddingBottom: "10px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Guest Login
          </p> */}
          <p style={{ textAlign: "center", marginTop: "15px" }}>
            {currentLanguage.dont_have_account}{" "}
            <a href={registerLink}>{currentLanguage.register_here}</a>
          </p>
          <p style={{ textAlign: "center", margin: "0" }}>
            {currentLanguage.forgotPassword}{" "}
            <a
              href={forgotPasswordLink}
              style={{ color: "#dc3545", textDecoration: "none" }}
            >
              {currentLanguage.click_here}
            </a>
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
