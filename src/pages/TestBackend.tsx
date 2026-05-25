import React, { useState } from "react";
import { checkBackendHealth } from "../services/healthService";

export const TestBackend: React.FC = () => {
  const [message, setMessage] = useState("");

  const handleTestBackend = async () => {
    try {
      const data = await checkBackendHealth();
      setMessage(data.message);
      console.log("Backend connected:", data);
    } catch (error) {
      setMessage("Backend connection failed");
      console.error("Backend connection failed:", error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Backend Connection Test</h1>

      <button onClick={handleTestBackend}>
        Test Backend
      </button>

      {message && (
        <p style={{ marginTop: "20px", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
};