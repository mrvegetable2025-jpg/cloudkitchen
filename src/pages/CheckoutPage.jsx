// src/pages/CheckoutPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";

const STORAGE_KEY = "sakthi_user";
const ORDER_COUNTER_KEY = "sakthi_order_counter";

export default function CheckoutPage() {
  const { cart, total, updateQty, removeFromCart, clearCart } = useCart();

  const [verified, setVerified] = useState(false);
  const [slot, setSlot] = useState("11:00 AM – 01:00 PM");
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);

  const WHATSAPP_NUM = import.meta.env.VITE_WHATSAPP_NUMBER;
  const STORE_NAME = import.meta.env.VITE_STORE_NAME || "Sakthi Kitchen";
  const ORDERS_WEBHOOK = import.meta.env.VITE_ORDERS_API_URL;

  // Load user
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  function availableSlots() {
    return ["11:00 AM – 01:00 PM"];
  }

  function itemPassesCutoff(item) {
    const iso = item.deliveryDate
      ? new Date(item.deliveryDate).toISOString().split("T")[0]
      : null;

    if (!iso) return { ok: false, reason: "Delivery date missing" };

    if ((item.category || "").toLowerCase() !== "lunch") return { ok: true };

    const d = new Date(iso);
    d.setHours(11, 0, 0, 0);

    const now = Date.now();
    const cutoff = 12 * 60 * 60 * 1000;

    if (d.getTime() - now < cutoff) {
      return {
        ok: false,
        reason: `Order closed for ${new Date(
          item.deliveryDate
        ).toLocaleDateString()}.`
      };
    }
    return { ok: true };
  }

  function validateAll() {
    if (!cart.length) return { ok: false, reason: "Cart empty" };
    for (const it of cart) {
      const r = itemPassesCutoff(it);
      if (!r.ok) return r;
    }
    return { ok: true };
  }

  function group(items) {
    const map = {};
    items.forEach((it) => {
      const title = it.dayLabel;
      if (!map[title]) map[title] = [];
      map[title].push(it);
    });
    return map;
  }

  function generateOrderId() {
    let c = Number(localStorage.getItem(ORDER_COUNTER_KEY) || "0");
    c += 1;
    localStorage.setItem(ORDER_COUNTER_KEY, c.toString());
    return "T" + String(c).padStart(3, "0");
  }

  function whatsappLink(id) {
    const grouped = group(cart);

    let itemsText = "";
    Object.keys(grouped).forEach((day) => {
      itemsText += `${day}:\n`;
      grouped[day].forEach((i) => {
        itemsText += `- ${i.qty || 1}x ${i.name} (${new Date(
          i.deliveryDate
        ).toLocaleDateString()})\n`;
      });
      itemsText += "\n";
    });

    const userText = user
      ? `${user.name}\n${user.phone}\n${user.address}\n\n`
      : "";

    const msg = encodeURIComponent(
`${STORE_NAME}

Order ID: ${id}

${userText}Order Details:
${itemsText}
Total: ₹${total}
Delivery Slot: ${slot}`
    );

    return `https://wa.me/${WHATSAPP_NUM.replace(/\+/g, "")}?text=${msg}`;
  }

// Save order to Google sheet (updated without payment method and status)
// Save order to Google Sheet (matches your exact columns)
// Save order to Google Sheet (matching Apps Script keys)
async function sendOrderToSheet(orderId) {
  if (!ORDERS_WEBHOOK) return;

  const now = new Date();

  const payload = {
    orderId,                              // ✔ script expects: data.orderId
    customerName: user?.name || "",       // ✔ data.customerName
    customerPhone: user?.phone || "",     // ✔ data.customerPhone
    customerAddress: user?.address || "", // ✔ data.customerAddress
    items: cart                           // ✔ data.items
      .map(
        (i) =>
          `${i.qty || 1}x ${i.name} (${new Date(i.deliveryDate).toLocaleDateString()})`
      )
      .join(" | "),
    total,                                // ✔ data.total
    slot,                                 // ✔ data.slot
    orderDate: now.toLocaleDateString(),  // ✔ data.orderDate
  };

  try {
    await fetch(ORDERS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Error sending order to sheet", error);
  }
}



  async function handleConfirmPayment() {
    const valid = validateAll();
    if (!valid.ok) return alert(valid.reason);

    if (!user) return alert("Please sign up first.");

    setVerified(true);
    alert("Payment confirmed — WhatsApp enabled.");
  }

  async function handleSend() {
    if (!verified) return alert("Confirm payment first.");

    const orderId = generateOrderId();

    await sendOrderToSheet(orderId);
    window.open(whatsappLink(orderId), "_blank");

    clearCart();
    setTimeout(() => (window.location.href = "/success"), 1200);
  }

  return (
    <div className="checkout-wrapper container">
      <h1 className="page-title">🧾 Checkout</h1>

      {/* ⭐ LEFT SIDE SUPPORT BUTTON */}
      <div
        style={{
          marginBottom: 20,
          padding: "12px 16px",
          width: "fit-content",
          borderRadius: 14,
          background: "rgba(0, 108, 255, 0.15)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#bcdcff",
          fontSize: 14,
          cursor: "pointer"
        }}
        onClick={() =>
          window.open(
            `https://wa.me/${WHATSAPP_NUM.replace(/\+/g, "")}?text=Hello%2C%20I%20need%20help`,
            "_blank"
          )
        }
      >
        💬 Need help? Contact Support
      </div>

      <div className="checkout-layout">
        {/* LEFT */}
        <div className="checkout-items">
          {cart.length === 0 && (
            <div className="glass-card">Your cart is empty</div>
          )}

          {cart.map((it) => (
            <div className="checkout-card" key={it.id}>
              <img
                src={it.imageUrl || "/no-image.png"}
                className="checkout-img"
              />
              <div className="checkout-info">
                <div className="checkout-title">{it.name}</div>
                <div className="checkout-sub">₹{it.price}</div>

                {/* ⭐ REMOVED DATE HERE (only dayLabel is shown) */}
                <div className="checkout-day muted">{it.dayLabel}</div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#9fbbe0",
                    marginTop: 6
                  }}
                >
                  Category: {it.category}
                </div>

                <div className="qty-controls">
                  <button onClick={() => updateQty(it.id, (it.qty || 1) - 1)}>
                    -
                  </button>
                  <span>{it.qty || 1}</span>
                  <button onClick={() => updateQty(it.id, (it.qty || 1) + 1)}>
                    +
                  </button>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(it.id)}
                >
                  Remove
                </button>
              </div>

              <div className="checkout-total">
                ₹{it.price * (it.qty || 1)}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="checkout-summary glass-card">
          <h3>Order Summary</h3>

          <small style={{ display: "block", marginBottom: 10 }} className="muted">
            *Packing and Delivery Fee Included
          </small>

          <div className="summary-row">
            <span>Total Amount</span>
            <span className="summary-amount">₹{total}</span>
          </div>

          <div className="checkout-block">
            <label className="label">Delivery Slot</label>
            <select
              className="select"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
            >
              {availableSlots().map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <small className="muted">
             
            </small>
          </div>

          <div className="qr-box glass-card">
            <h3 className="qr-title">Scan & Pay using GPay</h3>
            <img src="/gpay-qr.png" className="qr-image" />
            <p className="qr-note">After payment, click confirm.</p>
          </div>

          <button
            className="btn-pay"
            onClick={handleConfirmPayment}
          >
            I Have Completed Payment
          </button>

          {/* ⭐ SIGN-UP BUTTON CENTERED */}
          {!user && (
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button
                className="btn-ghost"
                style={{ width: "60%" }}
                onClick={() => (window.location.href = "/auth")}
              >
                Sign up
              </button>
            </div>
          )}

          <button
            className="btn-whatsapp"
            disabled={!verified || !user}
            style={{
              opacity: !verified || !user ? 0.5 : 1,
              pointerEvents: !verified || !user ? "none" : "auto"
            }}
            onClick={handleSend}
          >
            Send Order via WhatsApp
          </button>

          <button
            className="btn-ghost btn-block"
            style={{ marginTop: 10, color: "red" }}
            onClick={clearCart}
          >
            Clear Order
          </button>
        </div>
      </div>
    </div>
  );
}
