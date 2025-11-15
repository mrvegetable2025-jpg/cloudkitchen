import React from "react";
import { Link } from "react-router-dom";

export default function SuccessPage() {
  return (
    <div className="success-wrapper">
      <div className="success-card">
        
        <div className="checkmark-circle">
          <div className="checkmark"></div>
        </div>

        <h1>Order Placed Successfully! 🎉</h1>
        <p>Your order has been received.</p>

        {/* --- Section 1: Intro Food Quality --- */}
        <div className="success-section">
          <h3>Homemade South Indian Dinners – Light, Tasty & Heartwarming</h3>
          <p>Pure Taste • Hygienic • Homemade Love</p>
        </div>

        {/* --- Section 2: Why Choose Thayaar Kitchen --- */}
        <div className="success-section checklist">
          <h3>🌸 Why Choose Thayaar Kitchen?</h3>
          <ul>
            <li>✅ Homemade & Hygienic</li>
            <li>✅ No Preservatives</li>
            <li>✅ Temple-Taste South Indian Food</li>
            <li>✅ Cooked Fresh Every Day</li>
          </ul>
        </div>

        {/* --- Section 3: Tradition & Taste --- */}
        <div className="success-section">
       
          <p>
            Thayaar Kitchen delivers <strong>“Ammavin Samayal Taste”</strong> right to your doorstep.
          </p>
        </div>

        {/* --- Section 4: Emotional Line --- */}
        <div className="success-section">
          <p>Bringing the warmth of Amma’s Samayal straight to your plate ❤️</p>
        </div>

        {/* --- Section 5: Final line --- */}
  

        <Link to="/">
          <button className="success-btn">Back to Home</button>
        </Link>

      </div>
    </div>
  );
}
