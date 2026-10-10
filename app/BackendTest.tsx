
"use client";

import { useState } from "react";

export default function BackendTest() {
  const [message, setMessage] = useState("Not connected yet");

  async function testBackend() {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/health"
      );

      const data = await response.json();
      setMessage(data.status);
    } catch (error) {
      setMessage("Connection failed");
      console.error(error);
    }
  }

  return (
    <div>
      <button onClick={testBackend}>
        Test Flask Backend
      </button>
      <p>Backend status: {message}</p>
    </div>
  );
}
