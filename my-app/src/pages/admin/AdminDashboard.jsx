import "./AdminDashboard.css";

import { useEffect, useState }
from "react";

import axios from "axios";

function AdminDashboard() {

  const [merchants, setMerchants] =
    useState([]);

  /* =========================
     FETCH MERCHANTS
  ========================= */

  const fetchMerchants =
    async () => {

      try {

        const response =
          await axios.get(
            "http://localhost:5000/api/admin/merchants"
          );

        setMerchants(
          response.data
        );

      } catch (error) {

        console.log(error);
      }
    };

  /* =========================
     APPROVE
  ========================= */

  const handleApprove =
    async (id) => {

      try {

        await axios.put(

          `http://localhost:5000/api/admin/approve/${id}`
        );

        fetchMerchants();

      } catch (error) {

        console.log(error);
      }
    };

  /* =========================
     REJECT
  ========================= */

  const handleReject =
    async (id) => {

      try {

        await axios.put(

          `http://localhost:5000/api/admin/reject/${id}`
        );

        fetchMerchants();

      } catch (error) {

        console.log(error);
      }
    };

  /* =========================
     LOAD
  ========================= */

  useEffect(() => {

    fetchMerchants();

  }, []);

  return (

    <div className="admin-page">

      {/* SIDEBAR */}

      <div className="admin-sidebar">

        <h2>
          OmniRetail
        </h2>

      </div>

      {/* CONTENT */}

      <div className="admin-content">

        <h1>
          Merchant Approvals
        </h1>

        <div className="merchant-list">

          {merchants.map(
            (merchant) => (

            <div
              className="merchant-card"

              key={merchant._id}
            >

              <div>

                <h2>
                  {
                    merchant.restaurantName
                  }
                </h2>

                <p>
                  {
                    merchant.email
                  }
                </p>

                <p>
                  {
                    merchant.phoneNumber
                  }
                </p>

                <span
                  className={
                    merchant.isApproved
                    ? "approved"
                    : "pending"
                  }
                >

                  {
                    merchant.isApproved
                    ? "Approved"
                    : "Pending"
                  }

                </span>

              </div>

              <div className="action-buttons">

                <button
                  className="approve-btn"

                  onClick={() =>
                    handleApprove(
                      merchant._id
                    )
                  }
                >
                  Approve
                </button>

                <button
                  className="reject-btn"

                  onClick={() =>
                    handleReject(
                      merchant._id
                    )
                  }
                >
                  Reject
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;