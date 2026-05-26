import { useEffect, useState } from "react";

import "./MerchantOrders.css";

function MerchantOrders() {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    fetchOrders();

  }, []);

  const fetchOrders = async () => {

    try {

      /* =========================
         GET MERCHANT
      ========================= */

      const merchant =
  JSON.parse(

    localStorage.getItem(
      "user"
    )

  );

      if (!merchant?._id) {

        setError(
          "Merchant not logged in."
        );

        setLoading(false);

        return;

      }

      /* =========================
         API CALL
      ========================= */

      const response =
        await fetch(

          `http://localhost:5000/api/orders/merchant/${merchant._id}`

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
     UPDATE STATUS
  ========================= */

  const updateStatus = async (
    orderId,
    newStatus
  ) => {

    try {

      const response =
        await fetch(

          `http://localhost:5000/api/orders/${orderId}/status`,

          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              orderStatus:
                newStatus

            })

          }

        );

      const data =
        await response.json();

      if (data.success) {

        fetchOrders();

      } else {

        alert(data.message);

      }

    } catch (err) {

      alert(
        "Failed to update status."
      );

    }

  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <div className="merchant-orders-page">

        <h2>
          Loading Orders...
        </h2>

      </div>

    );

  }

  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (

      <div className="merchant-orders-page">

        <h2 className="error-text">
          {error}
        </h2>

      </div>

    );

  }

  return (

    <div className="merchant-orders-page">

      <h1 className="page-title">
        Customer Orders
      </h1>

      {

        orders.length === 0 ? (

          <div className="empty-orders">

            <h2>
              No Orders Yet
            </h2>

          </div>

        ) : (

          <div className="orders-container">

            {

              orders.map((order) => (

                <div
                  key={order._id}
                  className="order-card"
                >

                  <div className="order-header">

                    <h2>
                      Order ID
                    </h2>

                    <p>
                      {order._id}
                    </p>

                  </div>

                  <div className="order-section">

                    <h3>
                      Customer
                    </h3>

                    <p>
                      {order.customerName || "Customer"}
                    </p>

                  </div>

                  <div className="order-section">

                    <h3>
                      Address
                    </h3>

                    <p>
                      {order.address}
                    </p>

                  </div>

                  <div className="order-section">

                    <h3>
                      Payment
                    </h3>

                    <p>
                      {order.paymentMethod}
                    </p>

                    <p>
                      {order.paymentStatus}
                    </p>

                  </div>

                  <div className="order-section">

                    <h3>
                      Order Status
                    </h3>

                    <p className="status-badge">
                      {order.orderStatus}
                    </p>
                  </div>

                  <div className="order-section">

                    <h3>
                      Items
                    </h3>

                    <div className="items-list">

                      {

                        order.items.map(

                          (
                            item,
                            index
                          ) => (

                            <div
                              key={index}
                              className="item-row"
                            >

                              <span>
                                {item.name}
                              </span>

                              <span>
                                ×
                                {item.quantity}
                              </span>

                              <span>
                                ₹
                                {item.price}
                              </span>

                            </div>

                          )

                        )

                      }

                    </div>

                  </div>

                  <div className="order-footer">

                    <h2>
                      Total:
                      {" "}
                      ₹
                      {order.totalAmount}
                    </h2>

                    <select

                      value={
                        order.orderStatus
                      }

                      onChange={(e) =>

                        updateStatus(

                          order._id,

                          e.target.value

                        )

                      }

                    >

                      <option value="PLACED">
                        PLACED
                      </option>

                      <option value="PREPARING">
                        PREPARING
                      </option>

                      <option value="OUT_FOR_DELIVERY">
                        OUT FOR DELIVERY
                      </option>

                      <option value="DELIVERED">
                        DELIVERED
                      </option>

                      <option value="CANCELLED">
                        CANCELLED
                      </option>

                    </select>

                  </div>

                </div>

              ))

            }

          </div>

        )

      }

    </div>

  );

}

export default MerchantOrders;