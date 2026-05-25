import "./WaitingApproval.css";
import { useNavigate } from "react-router-dom";

export default function WaitingApproval() {
  const navigate = useNavigate();

  const steps = [
    { icon: "📝", label: "Application Submitted",  done: true  },
    { icon: "🔍", label: "Admin Review",            done: false },
    { icon: "✅", label: "Approval & Activation",   done: false },
  ];

  return (
    <div className="wa-page">

      {/* Floating food bubbles — matches brand */}
      <div className="wa-bubbles" aria-hidden="true">
        {["🍕","🍣","🍔","🌮","🥗","🍜","🧁","🍛"].map((e, i) => (
          <span key={i} className="wa-bubble" style={{ "--i": i }}>{e}</span>
        ))}
      </div>

      <div className="wa-card">

        {/* Animated clock icon */}
        <div className="wa-icon-wrap">
          <div className="wa-icon-ring" />
          <div className="wa-icon">⏳</div>
        </div>

        {/* Heading */}
        <h1 className="wa-title">Registration Under Review</h1>
        <p className="wa-sub">
          Your restaurant has been submitted successfully.<br />
          Our admin team will review your application within <strong>24 hours</strong>.
        </p>

        {/* Status badge */}
        <div className="wa-badge">
          <span className="wa-badge__dot" />
          Pending Approval
        </div>

        {/* Progress steps */}
        <div className="wa-steps">
          {steps.map((s, i) => (
            <div key={i} className={`wa-step ${s.done ? "wa-step--done" : i === 1 ? "wa-step--active" : ""}`}>
              <div className="wa-step__circle">
                {s.done ? "✓" : s.icon}
              </div>
              {i < steps.length - 1 && (
                <div className={`wa-step__line ${s.done ? "wa-step__line--done" : ""}`} />
              )}
              <span className="wa-step__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="wa-info">
          <span className="wa-info__icon">💡</span>
          <p>You'll receive a notification once your account is approved. Make sure your contact details are correct.</p>
        </div>

        {/* Actions */}
        <div className="wa-actions">
          <button className="wa-btn wa-btn--ghost" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
          <button className="wa-btn wa-btn--primary" onClick={() => window.location.reload()}>
            Refresh Status
          </button>
        </div>

      </div>
    </div>
  );
}