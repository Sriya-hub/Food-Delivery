import "./RestaurantCard.css";

import { useNavigate }
from "react-router-dom";

function RestaurantCard({

  restaurant

}) {

  const navigate =
    useNavigate();

  /* =========================
     OPEN RESTAURANT
  ========================= */

  const openRestaurant =
    () => {

      console.log(
        "Restaurant:",
        restaurant
      );

      navigate(

        `/restaurant/${restaurant._id}`
      );
    };

  return (

    <div

      className="restaurant-card"

      onClick={
        openRestaurant
      }
    >

      {/* IMAGE */}

      <div className="restaurant-image-container">

        <img

          className="restaurant-image"

          src={

            restaurant.restaurantImage

            ? restaurant.restaurantImage

            : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"
          }

          alt={
            restaurant.restaurantName
          }
        />

      </div>

      {/* INFO */}

      <div className="restaurant-info">

        <h3>

          {
            restaurant.restaurantName
          }

        </h3>

        <p className="restaurant-type">

          ⭐ 4.5 • {

            restaurant.restaurantType
          }

        </p>

        <p className="restaurant-address">

          📍 {

            restaurant.restaurantAddress
          }

        </p>

        <div className="restaurant-bottom">

          <span>

            ⏰ {

              restaurant.openingTime
            }

            {" - "}

            {
              restaurant.closingTime
            }

          </span>

        </div>

      </div>

    </div>
  );
}

export default RestaurantCard;