import "./OrderSuccess.css";

import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import Header from "../../components/customer/Header";

function OrderSuccess() {

  const { orderId } = useParams();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    fetchOrder();

  }, []);

  const fetchOrder = async () => {

    try {

      const response =
        await fetch(

          `http://localhost:5000/api/orders/${orderId}`

        );

      const data =
        await response.json();

      if (data.success) {

        setOrder(data.order);

      } else {

        setError(data.message);

      }

    } catch (err) {

      setError("Failed to load order.");

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (

      <div>

        <Header />

        <h2 style={{ textAlign: "center", marginTop: "50px" }}>
          Loading Order...
        </h2>

      </div>

    );

  }

  if (error) {

    return (

      <div>

        <Header />

        <h2 style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
          {error}
        </h2>

      </div>

    );

  }

  return (

    <div className="success-page">

      <Header />

      <div className="success-container">

        <div className="success-box">

          <h1>
            ✅ Order Placed Successfully
          </h1>

          <p>
            Your food is being prepared.
          </p>

          <div className="order-details">

            <h2>
              Order ID:
            </h2>

            <p>
              {order._id}
            </p>

            <h2>
              Payment Method:
            </h2>

            <p>
              {order.paymentMethod}
            </p>

            <h2>
              Payment Status:
            </h2>

            <p>
              {order.paymentStatus}
            </p>

            <h2>
              Order Status:
            </h2>

            <p>
              {order.orderStatus}
            </p>

            <h2>
              Delivery Address:
            </h2>

            <p>
              {order.address}
            </p>

            <h2>
              Total Amount:
            </h2>

            <p>
              ₹{order.totalAmount}
            </p>

            <h2>
              Ordered Items:
            </h2>

            <div className="items-list">

              {order.items.map((item, index) => (

                <div
                  key={index}
                  className="item-card"
                >

                  <p>
                    <strong>
                      {item.name}
                    </strong>
                  </p>

                  <p>
                    Quantity:
                    {" "}
                    {item.quantity}
                  </p>

                  <p>
                    Price:
                    {" "}
                    ₹{item.price}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default OrderSuccess;