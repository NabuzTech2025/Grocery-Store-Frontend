// src/components/PrivacyPolicyContent.js
import React from "react";
import { Helmet } from "react-helmet";
import BombayPrivacyPolicy from "./bombayPrivacyPolicy";

const PrivacyPolicyContent = () => {
  const appName = import.meta.env.VITE_APP_NAME;

  // Define policy data based on app name
  const getPolicyData = () => {
    if (appName === "Bombay") {
      return {
        title: "Datenschutzerklärung - Bombay Heimservice",
        description: "Privacy Policy for Bombay Heimservice",
        component: BombayPrivacyPolicy,
      };
    }
    // Add other apps here if needed
    return {
      title: "Privacy Policy",
      description: "Privacy Policy",
      component: null,
    };
  };

  const policyData = getPolicyData();
  const PolicyComponent = policyData.component;

  return (
    <div className="privacy-policy-container">
      <Helmet>
        <title>{policyData.title}</title>
        <meta name="description" content={policyData.description} />
      </Helmet>
      <div className="container py-5">
        {PolicyComponent ? (
          <PolicyComponent />
        ) : (
          <p>No privacy policy available.</p>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicyContent;
