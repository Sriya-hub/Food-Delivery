import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/customer/Header";
import "./Cart.css";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const save = (updated) => {
    setItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const inc = (id) => save(items.map(i => i._id === id ? { ...i, quantity: i.quantity + 1 } : i));
  const dec = (id) => save(items.map(i => i._id === id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
  const del = (id) => save(items.filter(i => i._id !== id));
  const clear = () => save([]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = items.length > 0 ? 40 : 0;
  const total    = subtotal + delivery;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="cart-page">
      <Header />

      <div className="cart-wrap">
        {/* ── Page title ── */}
        <div className="cart-title">
          <h1>My Cart</h1>
          {items.length > 0 && (
            <button className="cart-clear" onClick={clear}>Clear all</button>
          )}
        </div>

        {items.length === 0 ? (
          /* ── Empty state ── */
          <div className="cart-empty">
            <div className="cart-empty__icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add delicious items from a restaurant to get started.</p>
            <button className="cart-empty__btn" onClick={() => navigate("/")}>Browse Restaurants</button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* ── Items list ── */}
            <div className="cart-items">
              {items.map(item => (
                <div className="cart-item" key={item._id}>
                  <div className="cart-item__img">
                    <img
                      src={item.image ? `http://localhost:5000${item.image}` : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"}
                      alt={item.name}
                    />
                  </div>
                  <div className="cart-item__info">
                    <div className="cart-item__top">
                      <div>
                        <h3 className="cart-item__name">{item.name}</h3>
                        {item.category && <span className="cart-item__cat">{item.category}</span>}
                      </div>
                      <button className="cart-item__del" onClick={() => del(item._id)} aria-label="Remove">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                    <div className="cart-item__bottom">
                      <span className="cart-item__price">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <div className="cart-item__qty">
                        <button onClick={() => dec(item._id)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => inc(item._id)}>+</button>
                      </div>
                    </div>
                    <span className="cart-item__unit">₹{item.price} each</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order summary ── */}
            <div className="cart-summary">
              <h2 className="cart-summary__title">Order Summary</h2>
              <div className="cart-summary__rows">
                <div className="cart-summary__row">
                  <span>Items ({totalQty})</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="cart-summary__row">
                  <span>Delivery fee</span>
                  <span>₹{delivery}</span>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Grand Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <button className="cart-checkout" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button className="cart-continue" onClick={() => navigate("/")}>← Continue Shopping</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}