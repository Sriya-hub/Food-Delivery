import "./MerchantTopbar.css";

import {
  useEffect,
  useState
} from "react";

function MerchantTopbar() {

  const [merchant, setMerchant] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* =========================
     FETCH MERCHANT
  ========================= */

  useEffect(() => {

    fetchMerchant();

  }, []);

  const fetchMerchant = async () => {

    try {

      /* =========================
         GET LOGGED USER
      ========================= */

      const user =
        JSON.parse(

          localStorage.getItem(
            "user"
          )

        );

      if (!user?._id) {

        console.log(
          "Merchant not logged in"
        );

        setLoading(false);

        return;

      }

      /* =========================
         FETCH FROM BACKEND
      ========================= */

      const response =
        await fetch(

          `http://localhost:5000/api/merchant-settings/settings/${user._id}`

        );

      const data =
        await response.json();

      console.log(data);

      if (data.success) {

        setMerchant(
          data.merchant
        );

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  /* =========================
     TOGGLE ONLINE STATUS
  ========================= */

  const toggleStatus = async () => {

    try {

      const response =
        await fetch(

          `http://localhost:5000/api/merchant-settings/settings/${merchant._id}/online`,

          {
            method: "PATCH",

            headers: {

              "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

              isOnline:
                !merchant.isOnline

            })

          }

        );

      const data =
        await response.json();

      if (data.success) {

        setMerchant({

          ...merchant,

          isOnline:
            data.isOnline

        });

      }

    } catch (error) {

      console.log(error);

    }

  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (

      <div className="merchant-topbar">

        <h3>
          Loading...
        </h3>

      </div>

    );

  }

  return (

    <div className="merchant-topbar">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <div className="merchant-info">

        <h3>

          {

            merchant?.restaurantName ||

            merchant?.name ||

            "Restaurant"

          }

        </h3>

        <p>

          {

            merchant?.email ||

            merchant?.restaurantType ||

            "Restaurant"

          }

        </p>

      </div>

      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="merchant-profile">

        <button

          className={

            merchant?.isOnline

              ? "status-btn online"

              : "status-btn offline"

          }

          onClick={toggleStatus}

        >

          <span className="status-dot"></span>

          {

            merchant?.isOnline

              ? "Online"

              : "Offline"

          }

        </button>

      </div>

    </div>

  );

}

export default MerchantTopbar;