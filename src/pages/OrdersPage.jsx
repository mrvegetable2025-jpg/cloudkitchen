// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { parseCSV } from "../utils/csvParser";
import { upcomingDates } from "../utils/date";

function formatCountdown(hoursLeft) {
  if (hoursLeft <= 0) return null;
  const totalMinutes = Math.floor(hoursLeft * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

export default function OrdersPage() {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const meal = (searchParams.get("meal") || "lunch").toLowerCase();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH MENU
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const url = import.meta.env.VITE_SHEET_MENU_CSV_URL;
        const r = await fetch(url);
        const txt = await r.text();

        const parsed = parseCSV(txt).map((r) => ({
          id: r.id || Math.random().toString(36).slice(2, 9),
          name: r.name,
          description: r.description,
          price: Number(r.price || 0),
          category: (r.category || "").toLowerCase(),
          isActive: ((r.isActive || "true").toLowerCase() === "true"),
          day: (r.day || r.availableDays || "").toLowerCase(),
          imageUrl: r.imageUrl,
          stockAvailability: (r.stockAvailability || "in").toLowerCase(),
        }));

        setMenuItems(parsed.filter((p) => p.category === meal && p.isActive));
      } catch (e) {
        console.error("Menu load failed", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [meal]);

  if (loading)
    return (
      <div className="center">
        <div className="spinner" />
      </div>
    );

  // UPCOMING 7 DAY FILTER
  const upcomingAll = upcomingDates(7);
  const upcoming = upcomingAll.filter((d) => {
    const dow = new Date(d.iso).getDay();
    return dow !== 0 && dow !== 6;
  });

  const daysWithItems = upcoming
    .filter((d) =>
      menuItems.some((mi) => {
        if (!mi.day) return false;
        const allowed = mi.day
          .split(/[\s,;|]+/).map((x) => x.trim().slice(0, 3).toLowerCase());
        const wk = new Date(d.iso)
          .toLocaleDateString(undefined, { weekday: "short" })
          .slice(0, 3).toLowerCase();
        return allowed.includes(wk);
      })
    )
    .slice(0, 5);

  return (
    <div className="container">
      <h1 className="page-title">Upcoming Menu</h1>

      {daysWithItems.length === 0 && (
        <div className="glass-card" style={{ padding: 20 }}>
          No menus available for the upcoming days.
        </div>
      )}

      {daysWithItems.map((d) => {
        const items = menuItems.filter((mi) => {
          const allowed = (mi.day || "")
            .split(/[\s,;|]+/).map((x) => x.trim().slice(0, 3).toLowerCase());
          const wk = new Date(d.iso)
            .toLocaleDateString(undefined, { weekday: "short" })
            .slice(0, 3).toLowerCase();
          return allowed.includes(wk);
        });

        const labelFull = new Date(d.iso).toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        });

        return (
          <section key={d.iso} style={{ marginBottom: 38 }}>

            {/* ⭐✨ FLOATING GLASS DATE TILE (Style C) */}
            <div className="date-tile fade-soft">
              <span className="date-icon">📅</span>
              <span>{labelFull}</span>
            </div>

            <div className="grid">
              {items.map((it) => {
                let isClosed = false;
                let countdownText = "";
                const category = it.category;

                // LUNCH CUT-OFF
                if (category === "lunch") {
                  const delivery = new Date(d.iso);
                  delivery.setHours(11, 0, 0, 0);
                  const diffHours = (delivery.getTime() - Date.now()) / 3600000;
                  const hoursLeftToClose = diffHours - 14;
                  isClosed = hoursLeftToClose <= 0;
                  countdownText = isClosed
                    ? "Order Closed"
                    : `Order Ends in ${formatCountdown(hoursLeftToClose)}`;
                }

                // SNACKS CUT-OFF
                if (category === "snacks") {
                  const delivery = new Date(d.iso);
                  delivery.setHours(16, 0, 0, 0);
                  const diffHours = (delivery.getTime() - Date.now()) / 3600000;
                  const hoursLeftToClose = diffHours - 14;
                  isClosed = hoursLeftToClose <= 0;
                  countdownText = isClosed
                    ? "Order Closed"
                    : `Order Ends in ${formatCountdown(hoursLeftToClose)}`;
                }

                const isOutOfStock = it.stockAvailability === "out";
                const isBlocked = isClosed || isOutOfStock;

                return (
                  <div
                    className="food-card"
                    key={it.id}
                    style={{
                      position: "relative",
                      filter: isBlocked ? "grayscale(70%) blur(0.5px)" : "none",
                      opacity: isBlocked ? 0.6 : 1,
                    }}
                  >
                    {/* Stock & Closed Tags */}
                    {isBlocked && (
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          background: isOutOfStock
                            ? "rgba(255,0,0,0.85)"
                            : "rgba(255,165,0,0.9)",
                          padding: "6px 12px",
                          color: "white",
                          fontWeight: "700",
                          borderRadius: "8px",
                          fontSize: 12,
                          boxShadow: "0 0 10px black",
                        }}
                      >
                        {isOutOfStock ? "OUT OF STOCK" : "ORDER CLOSED"}
                      </div>
                    )}

                    {/* Image */}
                    <div className="card-img-box">
                      <img
                        src={it.imageUrl || "/no-image.png"}
                        className="food-img"
                        alt={it.name}
                        onError={(e) => (e.target.src = "/no-image.png")}
                      />
                    </div>

                    <div className="food-info">
                      <h3>{it.name}</h3>
                      <p>{it.description || "No description"}</p>

                      <div style={{ fontSize: 12, color: "#9fbbe0" }}>
                        {category === "snacks"
                          ? "Delivery Slot: 04:00 PM – 06:00 PM"
                          : "Delivery Slot: 11:00 AM – 01:00 PM"}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          marginTop: 6,
                          marginBottom: 6,
                          color: isClosed ? "red" : "#4ade80",
                        }}
                      >
                        {countdownText}
                      </div>

                      <div className="card-actions">
                        <div className="price">₹{it.price}</div>
                        <button
                          className="btn-primary"
                          disabled={isBlocked}
                          style={{
                            opacity: isBlocked ? 0.4 : 1,
                            cursor: isBlocked ? "not-allowed" : "pointer",
                          }}
                          onClick={() => {
                            if (isBlocked) return;
                            addToCart({
                              id: it.id,
                              name: it.name,
                              price: it.price,
                              imageUrl: it.imageUrl,
                              category: it.category,
                              deliveryDate: d.iso,
                              deliveryAvailable: !isClosed,
                              dayLabel: new Date(d.iso).toLocaleDateString(
                                undefined,
                                { weekday: "long" }
                              ),
                            });
                          }}
                        >
                          {isBlocked
                            ? (isOutOfStock ? "Out of Stock" : "Order Closed")
                            : `Add to cart (for ${new Date(
                                d.iso
                              ).toLocaleDateString()})`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* DATE TILE CSS */}
      <style>{`
        .date-tile {
          width: fit-content;
          margin: 14px auto 26px;
          padding: 10px 22px;
          border-radius: 20px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.20);
          color: #bde0ff;
          font-size: 1.05rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 0 18px rgba(0,160,255,0.28);
          animation: glowPulse 2.2s infinite ease-in-out;
        }

        .date-icon {
          font-size: 1.2rem;
        }

        .fade-soft {
          animation: fadeInSoft 0.7s ease-out;
        }

        @keyframes fadeInSoft {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes glowPulse {
          0% { box-shadow: 0 0 12px rgba(0,160,255,0.25); }
          50% { box-shadow: 0 0 22px rgba(0,160,255,0.45); }
          100% { box-shadow: 0 0 12px rgba(0,160,255,0.25); }
        }
      `}</style>
    </div>
  );
}
