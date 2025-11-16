import React, { useEffect, useState } from "react";

export default function DeliveryCheckBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("deliveryCheckDone");
    if (!done) setShowBanner(true);
  }, []);

  const handleCheckLocation = () => {
    if (!navigator.geolocation) {
      alert("Location not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
        const whatsapp = "+918524845927";
        const message = `This is my accurate GPS location: ${mapLink}. Is delivery possible?`;

        window.open(
          `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
          "_blank"
        );

        localStorage.setItem("deliveryCheckDone", "true");
        setShowBanner(false);
      },
      (err) => {
        alert("Turn on GPS / High accuracy mode for more accurate location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  if (!showBanner) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.banner}>
        <div style={styles.left}>
          <span style={styles.icon}>📍</span>
          <span style={styles.text}>
            Check if we deliver to your location
          </span>
        </div>

        <button style={styles.btn} onClick={handleCheckLocation}>
          Check Now
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "10px",
    animation: "fadeSlide 0.7s ease",
  },

  banner: {
    width: "100%",
    padding: "14px 20px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    background: "rgba(0, 122, 255, 0.12)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(0, 150, 255, 0.35)",
    boxShadow: "0 0 28px rgba(0,140,255,0.25)",

    color: "#dff2ff",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  icon: {
    fontSize: "23px",
    filter: "drop-shadow(0 0 6px rgba(0,150,255,0.8))",
  },

  text: {
    fontSize: "1rem",
    fontWeight: "600",
    letterSpacing: "0.3px",
    textShadow: "0 0 8px rgba(0,150,255,0.6)",
  },

  btn: {
    background: "linear-gradient(90deg,#3b82f6,#1e40af)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "none",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 0 15px rgba(0,140,255,0.4)",
    transition: "0.25s",
  },
};

/* Add this in index.css or global CSS */
