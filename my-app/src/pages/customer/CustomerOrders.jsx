import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Header from "../../components/customer/Header";

import "./CustomerOrders.css";

function CustomerOrders() {

  const navigate = useNavigate();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    fetchOrders();

  }, []);

  /* =========================
     FETCH CUSTOMER ORDERS
  ========================= */

  const fetchOrders = async () => {

    try {

      const user =
        JSON.parse(

          localStorage.getItem(
            "user"
          )

        );

      if (!user?._id) {

        setError(
          "Please login first."
        );

        setLoading(false);

        return;

      }

      const response =
        await fetch(

          `http://localhost:5000/api/orders/customer/${user._id}`

        );

      const data =
        await response.json();

      if (data.success) {

        setOrders(data.orders);

      } else {

        setError(data.message);

      }

    } catch (err) {

      setError(
        "Failed to load orders."
      );

    } finally {

      setLoading(false);

    }

  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <div className="customer-orders-page">

        <Header />

        <div className="customer-orders-loading">

          <h2>
            Loading Orders...
          </h2>

        </div>

      </div>

    );

  }

  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (

      <div className="customer-orders-page">

        <Header />

        <div className="customer-orders-error">

          <h2>
            {error}
          </h2>

        </div>

      </div>

    );

  }

  return (

    <div className="customer-orders-page">

      <Header />

      <div className="customer-orders-container">

        <div className="customer-orders-header">

          <h1>
            My Orders
          </h1>

          <p>
            Track your food orders
          </p>

        </div>

        {

          orders.length === 0 ? (

            <div className="no-orders">

              <span>
                🍽
              </span>

              <h2>
                No Orders Yet
              </h2>

              <button
                onClick={() => navigate("/")}
              >
                Browse Restaurants
              </button>

            </div>

          ) : (

            <div className="orders-grid">

              {

                orders.map((order) => (

                  <div
                    key={order._id}
                    className="order-card"
                  >

                    {/* =========================
                        TOP
                    ========================= */}

                    <div className="order-top">

                      <div>

                        <h2>
                          Order ID
                        </h2>

                        <p>
                          {order._id}
                        </p>

                      </div>

                      <div
                        className={`status-badge ${order.orderStatus.toLowerCase()}`}
                      >

                        {order.orderStatus}

                      </div>

                    </div>

                    {/* =========================
                        ITEMS
                    ========================= */}

                    <div className="order-items">

                      {

                        order.items.map(

                          (
                            item,
                            index
                          ) => (

                            <div
                              key={index}
                              className="order-item"
                            >

                              <div className="item-left">

                                <img

                                  src={

                                    item.image

                                      ? `http://localhost:5000${item.image}`

                                      : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400"

                                  }

                                  alt={item.name}

                                />

                                <div>

                                  <h3>
                                    {item.name}
                                  </h3>

                                  <p>
                                    Qty:
                                    {" "}
                                    {item.quantity}
                                  </p>

                                </div>

                              </div>

                              <h4>
                                ₹
                                {item.price * item.quantity}
                              </h4>

                            </div>

                          )

                        )

                      }

                    </div>

                    {/* =========================
                        ORDER INFO
                    ========================= */}

                    <div className="order-info">

                      <div className="info-row">

                        <span>
                          Payment Method
                        </span>

                        <strong>
                          {order.paymentMethod}
                        </strong>

                      </div>

                      <div className="info-row">

                        <span>
                          Payment Status
                        </span>

                        <strong>
                          {order.paymentStatus}
                        </strong>

                      </div>

                      <div className="info-row">

                        <span>
                          Delivery Address
                        </span>

                        <strong>
                          {order.address}
                        </strong>

                      </div>

                    </div>

                    {/* =========================
                        FOOTER
                    ========================= */}

                    <div className="order-footer">

                      <h2>

                        Total:
                        {" "}
                        ₹
                        {order.totalAmount}

                      </h2>

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>

    </div>

  );

}

export default CustomerOrders;