import React, { useState, useEffect } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const REVIEWS_WEBHOOK = import.meta.env.VITE_REVIEWS_WEBHOOK;
  const REVIEWS_JSON = import.meta.env.VITE_REVIEWS_SHEET_JSON; // Published JSON link

  useEffect(() => {
    if (!REVIEWS_JSON) return;
    fetch(REVIEWS_JSON)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch(() => {});
  }, []);

  async function submitReview() {
    if (!name || !review) return alert("Please enter your name & review!");

    setLoading(true);

    const payload = {
      name,
      rating,
      review,
    };

    try {
      await fetch(REVIEWS_WEBHOOK, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("✨ Thank you! Your review has been submitted.");
      setName("");
      setRating(5);
      setReview("");
    } catch {
      alert("❌ Unable to submit review. Try again later.");
    }

    setLoading(false);
  }

  return (
    <div className="reviews-wrapper">
      <h1 className="title-main">⭐ Customer Reviews</h1>

      {/* Form */}
      <div className="glass-card review-form">
        <h2 className="form-title">Write a Review</h2>

        <input
          className="input-modern"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="label">Rating</label>
        <select
          className="select modern-select"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ⭐
            </option>
          ))}
        </select>

        <textarea
          className="input-modern textarea"
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <button
          className="btn-submit"
          onClick={submitReview}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review ✨"}
        </button>
      </div>

      {/* Review list */}
      <h2 className="reviews-subtitle">💬 What Customers Say</h2>

      <div className="reviews-list">
        {reviews.map((rev, i) => (
          <div key={i} className="glass-card review-box fade-in">
            <div className="review-name">
              {rev.name} • <span className="star">{rev.rating}⭐</span>
            </div>
            <div className="review-text">{rev.review}</div>
          </div>
        ))}
      </div>

      {/* STYLE */}
      <style>
        {`
        /* PAGE BG */
        .reviews-wrapper {
          padding: 30px 15px;
          background: radial-gradient(circle at top, #0a1a2b, #030712 70%);
          min-height: 100vh;
        }

        .title-main {
          text-align: center;
          color: #bde0ff;
          font-size: 2rem;
          margin-bottom: 25px;
          font-weight: 700;
          text-shadow: 0 0 12px rgba(0,150,255,0.7);
        }

        /* GLASS FORM */
        .review-form {
          padding: 22px;
          border-radius: 18px;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 0 25px rgba(0,120,255,0.25);
          margin-bottom: 40px;
        }

        .form-title {
          color: #8ecaff;
          font-size: 1.4rem;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .input-modern, .textarea {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border-radius: 10px;
          border: none;
          background: rgba(255,255,255,0.15);
          color: white;
          outline: none;
          font-size: 1rem;
        }

        .textarea {
          min-height: 110px;
          resize: none;
        }

        .select {
          margin-bottom: 10px;
        }

        .btn-submit {
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(90deg, #3ba9ff, #005eff);
          color: #fff;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-submit:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        /* REVIEWS LIST */
        .reviews-subtitle {
          margin: 20px 0 10px;
          color: #9bd1ff;
          text-align: center;
          font-size: 1.4rem;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .review-box {
          padding: 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(12px);
          box-shadow: 0 0 20px rgba(0,140,255,0.25);
          animation: fadeIn 0.7s ease-in-out;
        }

        .review-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #7bc9ff;
        }

        .star {
          color: gold;
        }

        .review-text {
          margin-top: 5px;
          font-size: 1rem;
          opacity: 0.85;
          color: #e8f4ff;
        }

        /* FADE ANIMATION */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
    </div>
  );
}
