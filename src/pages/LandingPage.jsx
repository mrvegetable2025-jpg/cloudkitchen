// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseCSV } from "../utils/csvParser";
import BfImg from "../assets/breakfast.jpg";
import LunchImg from "../assets/lunch.jpg";
import DinnerImg from "../assets/dinner.jpg";
import SnacksImg from "../assets/snacks.jpg";

import DeliveryCheckBanner from "../components/DeliveryCheckBanner";

function fallbackParseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i] !== undefined ? cols[i] : "";
    });
    return obj;
  });
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeMeal, setActiveMeal] = useState([]);

  const meals = [
    { id: "breakfast", label: "Breakfast", img: BfImg },
    { id: "lunch", label: "Lunch", img: LunchImg },
    { id: "dinner", label: "Dinner", img: DinnerImg },
    { id: "snacks", label: "Snacks", img: SnacksImg },
  ];

  useEffect(() => {
    let mounted = true;

    async function loadActiveMeal() {
      try {
        const cache = localStorage.getItem("menuCache");
        const now = Date.now();

        // ✔ CACHE VALID FOR 1 HOUR
        if (cache) {
          const parsed = JSON.parse(cache);
          if (now - parsed.time < 60 * 60 * 1000) {
            console.log("⚡ Using cached sheet");
            processRows(parsed.data);
            return;
          }
        }

        // ✔ FRESH FETCH
        const base = import.meta.env.VITE_SHEET_MENU_CSV_URL;
        const sep = base.includes("?") ? "&" : "?";
        const url = `${base}${sep}cb=${now}`;

        console.log("Fetching sheet:", url);

        const res = await fetch(url, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });

        const text = await res.text();

        let rows = [];

        try {
          rows = parseCSV(text);
        } catch {
          rows = fallbackParseCSV(text);
        }

        // ✔ Store in cache
        localStorage.setItem(
          "menuCache",
          JSON.stringify({ data: rows, time: now })
        );

        if (mounted) processRows(rows);
      } catch (err) {
        console.error("LandingPage error:", err);
      }
    }

    function processRows(rows) {
      const active = [];

      ["breakfast", "lunch", "dinner", "snacks"].forEach((meal) => {
        const exists = rows.some((row) => {
          if (!row) return false;
          const cat = (row.category || "").trim().toLowerCase();
          const act = (row.isActive || "").trim().toLowerCase();
          return cat === meal && ["true", "yes", "1"].includes(act);
        });
        if (exists) active.push(meal);
      });

      setActiveMeal(active);
    }

    loadActiveMeal();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="container">
      <DeliveryCheckBanner />

      <h1 className="page-title">Choose a Meal</h1>

      <div className="banner-grid">
        {meals.map((m) => {
          const isActive = activeMeal.includes(m.id);

          return (
            <div
              key={m.id}
              onClick={() => isActive && navigate(`/orders?meal=${m.id}`)}
              className={`meal-banner ${isActive ? "active-meal" : "inactive-meal"}`}
            >
              <img
                src={m.img}
                alt={m.label}
                style={{
                  width: "100%",
                  height: "150px",
                  borderRadius: "12px",
                  objectFit: "cover",
                  marginBottom: "10px",
                }}
              />

              <div className="meal-name">{m.label}</div>
              <div className="meal-sub">{isActive ? "Available" : "Coming Soon"}</div>
            </div>
          );
        })}
      </div>

      {/* ⭐⭐⭐ FULL ABOUT SECTION INCLUDED EXACTLY WITHOUT CHANGES ⭐⭐⭐ */}

      <section
        id="about"
        style={{
          marginTop: "70px",
          padding: "60px 25px",
          borderRadius: "28px",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 25px rgba(0, 140, 255, 0.25)",
          animation: "fadeIn 0.8s ease-out",
        }}
        className="glass-card"
      >
        <h2
          style={{
            textAlign: "center",
            color: "#bcdcff",
            fontSize: "2.4rem",
            fontWeight: "600",
            marginBottom: "18px",
            textShadow: "0 0 14px rgba(0,150,255,0.8)",
          }}
        >
          About Thaayar Kitchen
        </h2>

        <p
          style={{
            color: "#d5e9ff",
            fontSize: "1.15rem",
            lineHeight: "1.9",
            textAlign: "center",
            maxWidth: "900px",
            margin: "0 auto 35px auto",
          }}
        >
          Homemade South Indian Food – Light, Tasty & Heartwarming.
          <br />
          Freshly prepared, every bite filled with purity, and tradition.
        </p>

        <div
          style={{
            maxWidth: "750px",
            margin: "0 auto",
            padding: "25px 25px",
            borderRadius: "20px",
            background: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 15px rgba(0,150,255,0.2)",
          }}
        >
          <h3
            style={{
              color: "#ff9edc",
              fontSize: "1.5rem",
              textAlign: "center",
              marginBottom: "20px",
              textShadow: "0 0 10px rgba(255,70,150,0.7)",
            }}
          >
            🌸 Why Choose Thaayar Kitchen?
          </h3>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              color: "#dff9ff",
              fontSize: "1.15rem",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <li>✅ Homemade & Hygienic</li>
            <li>✅ No Preservatives</li>
            <li>✅ Cooked Fresh Every Day</li>
          </ul>
        </div>

        <p
          style={{
            color: "#d5e9ff",
            fontSize: "1.15rem",
            lineHeight: "1.9",
            textAlign: "center",
            maxWidth: "900px",
            margin: "40px auto 0 auto",
          }}
        >
          Fresh • Hygienic • Traditional South Indian Meals
          <br />
          <br />
          Thaayar Kitchen delivers “Ammavin Samayal Taste” right to your doorstep —
          bringing the warmth of Amma’s Samayal straight to your plate ❤️
        </p>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
