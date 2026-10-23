import React, { useEffect } from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function RedirectToStaffPortal() {
  const STAFF_PORTAL_URL = "http://localhost:5174";

  useEffect(() => {
    window.location.href = STAFF_PORTAL_URL;
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1120",
        color: "#f8fafc",
        padding: "1.5rem",
        textAlign: "center"
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #ea580c, #f97316)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          marginBottom: "1rem"
        }}
      >
        <ShieldCheck size={28} />
      </div>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>
        Opening Dedicated Staff Portal
      </h2>
      <p style={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: "400px", margin: "0 0 1.25rem 0" }}>
        The kitchen & staff operations hub is hosted on its own standalone website at port 5174.
      </p>
      <a
        href={STAFF_PORTAL_URL}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "#ea580c",
          color: "#fff",
          padding: "0.65rem 1.25rem",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.9rem"
        }}
      >
        <span>Go to Staff Portal (5174)</span>
        <ExternalLink size={16} />
      </a>
    </div>
  );
}
