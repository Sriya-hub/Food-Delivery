import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import axios                   from "axios";
import Header                  from "../../components/customer/Header";
import "./Checkout.css";

const API = "http://localhost:5000/api/checkout";

/* ── load Razorpay script once ── */
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ── small step indicator ── */
function Steps({ step }) {
  const labels = ["Delivery", "Payment", "Review"];
  return (
    <div className="ck-steps">
      {labels.map((l, i) => (
        <div key={l} className={`ck-step ${i < step ? "ck-step--done" : i === step ? "ck-step--active" : ""}`}>
          <div className="ck-step__circle">{i < step ? "✓" : i + 1}</div>
          <span>{l}</span>
          {i < labels.length - 1 && <div className="ck-step__line" />}
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();

  /* ── cart + user ── */
  const [cart,    setCart]  = useState([]);
  const [user,    setUser]  = useState(null);
  const [step,    setStep]  = useState(0);   // 0=delivery 1=payment 2=review
  const [loading, setLoad]  = useState(false);
  const [error,   setError] = useState("");

  /* ── form ── */
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [payMethod, setPay] = useState("COD"); // COD | ONLINE

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setCart(c);
    setUser(u);
    if (u) setForm(f => ({ ...f, name: u.name || "", phone: u.phone || "" }));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const subtotal  = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery  = cart.length ? 40 : 0;
  const total     = subtotal + delivery;
  const totalQty  = cart.reduce((s, i) => s + i.quantity, 0);

  /* merchantId from first cart item */
  const merchantId = cart[0]?.restaurantId || cart[0]?.merchantId || "";

  /* ── validation ── */
  const validateDelivery = () => {
    if (!form.name.trim())    return setError("Please enter your full name."),    false;
    if (!form.phone.trim())   return setError("Please enter your phone number."), false;
    if (!form.address.trim()) return setError("Please enter delivery address."),  false;
    return true;
  };

  /* ── place order ── */
  const placeOrder = async () => {
    setError("");
    if (!validateDelivery()) return;
    if (!user?._id) return setError("Please sign in to place an order.");
    if (!merchantId) return setError("Cart is missing restaurant info.");

    setLoad(true);
    try {
      const payload = {
        customerId:    user._id,
        merchantId,
        items:         cart.map(i => ({ foodId: i._id, name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
        address:       form.address,
        paymentMethod: payMethod,
        totalAmount:   total,
      };

      const { data } = await axios.post(`${API}/create-order`, payload);

      if (!data.success) throw new Error(data.message);

      /* ── COD ── */
      if (payMethod === "COD") {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cart-updated"));
        navigate("/order-success", { state: { orderId: data.orderId, method: "COD" } });
        return;
      }

      /* ── ONLINE / Razorpay ── */
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Razorpay SDK failed to load.");

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        order_id:    data.razorpayOrderId,
        name:        "OmniRetail",
        description: `Order #${data.orderId}`,
        prefill: {
          name:    form.name,
          contact: form.phone,
          email:   user.email || "",
        },
        theme: { color: "#ff6b2b" },

        handler: async (response) => {
          try {
            const verify = await axios.post(`${API}/verify-payment`, {
              orderId:            data.orderId,
              razorpayOrderId:    response.razorpay_order_id,
              razorpayPaymentId:  response.razorpay_payment_id,
              razorpaySignature:  response.razorpay_signature,
            });
            if (verify.data.success) {
              localStorage.removeItem("cart");
              window.dispatchEvent(new Event("cart-updated"));
              navigate("/order-success", { state: { orderId: data.orderId, method: "ONLINE" } });
            } else {
              setError("Payment verification failed. Contact support.");
            }
          } catch {
            setError("Payment verification error.");
          }
        },

        modal: { ondismiss: () => setLoad(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      return; // don't set loading false — modal is open

    } catch (e) {
      setError(e.response?.data?.message || e.message || "Something went wrong.");
    }
    setLoad(false);
  };

  if (!cart.length) return (
    <div className="ck-page">
      <Header />
      <div className="ck-empty">
        <span>🛒</span>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate("/")}>Browse Restaurants</button>
      </div>
    </div>
  );

  return (
    <div className="ck-page">
      <Header />

      <div className="ck-wrap">
        <div className="ck-head">
          <h1>Checkout</h1>
          <p>{totalQty} item{totalQty > 1 ? "s" : ""} · ₹{total.toLocaleString()}</p>
        </div>

        <Steps step={step} />

        <div className="ck-layout">

          {/* ── LEFT: form steps ── */}
          <div className="ck-form">

            {/* STEP 0 — Delivery */}
            <div className={`ck-card ${step === 0 ? "ck-card--active" : ""}`}>
              <div className="ck-card__head" onClick={() => setStep(0)}>
                <div className="ck-card__num">{step > 0 ? "✓" : "1"}</div>
                <h2>Delivery Details</h2>
                {step > 0 && <span className="ck-card__edit">Edit</span>}
              </div>

              {step === 0 && (
                <div className="ck-card__body">
                  <div className="ck-row">
                    <label>Full Name *
                      <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Doe" />
                    </label>
                    <label>Phone *
                      <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                    </label>
                  </div>
                  <label className="ck-full">Delivery Address *
                    <textarea rows={3} value={form.address} onChange={e => set("address", e.target.value)}
                      placeholder="House no., street, area, city, pincode…" />
                  </label>
                  {error && step === 0 && <p className="ck-error">{error}</p>}
                  <button className="ck-btn" onClick={() => { if (validateDelivery()) { setError(""); setStep(1); } }}>
                    Continue to Payment
                  </button>
                </div>
              )}
            </div>

            {/* STEP 1 — Payment */}
            <div className={`ck-card ${step === 1 ? "ck-card--active" : ""} ${step < 1 ? "ck-card--locked" : ""}`}>
              <div className="ck-card__head" onClick={() => step >= 1 && setStep(1)}>
                <div className="ck-card__num">{step > 1 ? "✓" : "2"}</div>
                <h2>Payment Method</h2>
                {step > 1 && <span className="ck-card__edit">Edit</span>}
              </div>

              {step === 1 && (
                <div className="ck-card__body">
                  <div className="ck-pay-opts">
                    {[
                      { id: "COD",    label: "Cash on Delivery", icon: "💵", sub: "Pay when your order arrives" },
                      { id: "ONLINE", label: "Pay Online",        icon: "💳", sub: "UPI, Cards, Net Banking via Razorpay" },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        className={`ck-pay-opt ${payMethod === opt.id ? "ck-pay-opt--active" : ""}`}
                        onClick={() => setPay(opt.id)}
                      >
                        <span className="ck-pay-opt__icon">{opt.icon}</span>
                        <div>
                          <strong>{opt.label}</strong>
                          <small>{opt.sub}</small>
                        </div>
                        <div className="ck-pay-opt__radio" />
                      </button>
                    ))}
                  </div>
                  <button className="ck-btn" onClick={() => setStep(2)}>Review Order</button>
                </div>
              )}
            </div>

            {/* STEP 2 — Review */}
            <div className={`ck-card ${step === 2 ? "ck-card--active" : ""} ${step < 2 ? "ck-card--locked" : ""}`}>
              <div className="ck-card__head" onClick={() => step >= 2 && setStep(2)}>
                <div className="ck-card__num">3</div>
                <h2>Review & Place Order</h2>
              </div>

              {step === 2 && (
                <div className="ck-card__body">
                  {/* delivery summary */}
                  <div className="ck-review-row">
                    <span>📍 Delivering to</span>
                    <strong>{form.address}</strong>
                  </div>
                  <div className="ck-review-row">
                    <span>💳 Payment</span>
                    <strong>{payMethod === "COD" ? "Cash on Delivery" : "Online (Razorpay)"}</strong>
                  </div>

                  {/* items */}
                  <div className="ck-items">
                    {cart.map(i => (
                      <div className="ck-item" key={i._id}>
                        <img src={i.image ? `http://localhost:5000${i.image}` : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=120&auto=format&fit=crop"} alt={i.name} />
                        <span className="ck-item__name">{i.name}</span>
                        <span className="ck-item__qty">×{i.quantity}</span>
                        <span className="ck-item__price">₹{(i.price * i.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {error && <p className="ck-error">{error}</p>}

                  <button className="ck-btn ck-btn--place" onClick={placeOrder} disabled={loading}>
                    {loading ? <span className="ck-spinner" /> : null}
                    {loading ? "Processing…" : payMethod === "COD" ? "Place Order" : "Pay ₹" + total.toLocaleString()}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT: order summary ── */}
          <aside className="ck-summary">
            <h2>Order Summary</h2>
            <div className="ck-summary__items">
              {cart.map(i => (
                <div className="ck-summary__item" key={i._id}>
                  <span className="ck-summary__item-name">{i.name} <em>×{i.quantity}</em></span>
                  <span>₹{(i.price * i.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="ck-summary__divider" />
            <div className="ck-summary__row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="ck-summary__row"><span>Delivery fee</span><span>₹{delivery}</span></div>
            <div className="ck-summary__row ck-summary__row--total"><span>Grand Total</span><span>₹{total.toLocaleString()}</span></div>
          </aside>

        </div>
      </div>
    </div>
  );
}