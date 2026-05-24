import "./MerchantDashboard.css";

function MerchantDashboard() {

  return (

    <div className="merchant-dashboard">

      <div className="dashboard-sidebar">

        <h2>
          OmniRetail
        </h2>

        <ul>

          <li>
            Dashboard
          </li>

          <li>
            Orders
          </li>

          <li>
            Menu
          </li>

          <li>
            Analytics
          </li>

          <li>
            Settings
          </li>

        </ul>

      </div>

      <div className="dashboard-content">

        <h1>
          Merchant Dashboard
        </h1>

        <div className="stats-grid">

          <div className="stat-card">

            <h2>
              ₹ 12,500
            </h2>

            <p>
              Today's Revenue
            </p>

          </div>

          <div className="stat-card">

            <h2>
              124
            </h2>

            <p>
              Orders
            </p>

          </div>

          <div className="stat-card">

            <h2>
              4.8 ⭐
            </h2>

            <p>
              Ratings
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default MerchantDashboard;