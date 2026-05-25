import { useEffect, useState }
from "react";

import axios
from "axios";

import Header
from "../../components/customer/Header";

import SearchBar
from "../../components/customer/SearchBar";

import CategorySection
from "../../components/customer/CategorySection";

import RestaurantCard
from "../../components/customer/RestaurantCard";

import "./Home.css";

function Home() {

  /* =========================
     STATES
  ========================= */

  const [restaurants, setRestaurants] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =========================
     FETCH RESTAURANTS
  ========================= */

  useEffect(() => {

    fetchRestaurants();

  }, []);

  const fetchRestaurants =
    async () => {

      try {

        const response =
          await axios.get(

            "http://localhost:5000/api/merchant/approved-restaurants"
          );

        console.log(
          response.data
        );

        setRestaurants(

          response.data.restaurants || []
        );

      } catch (error) {

        console.log(
          "Restaurant Fetch Error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="home">

      {/* =========================
          HEADER
      ========================= */}

      <Header />

      {/* =========================
          SEARCH
      ========================= */}

      <SearchBar />

      {/* =========================
          CATEGORY
      ========================= */}

      <CategorySection />

      {/* =========================
          RESTAURANTS
      ========================= */}

      <div className="restaurant-section">

        <div className="restaurant-header">

          <h2>
            Top Restaurants
          </h2>

          <p>
            Explore delicious foods
            from nearby restaurants
          </p>

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {
          loading ? (

            <div className="loading-restaurants">

              <h3>
                Loading Restaurants...
              </h3>

            </div>

          ) : restaurants.length === 0 ? (

            /* =========================
                EMPTY STATE
            ========================= */

            <div className="empty-restaurants">

              <h3>
                No Restaurants Found
              </h3>

              <p>
                No approved restaurants
                available currently.
              </p>

            </div>

          ) : (

            /* =========================
                RESTAURANT GRID
            ========================= */

            <div className="restaurant-grid">

              {
                restaurants.map((restaurant) => (

                  <RestaurantCard

                    key={restaurant._id}

                    restaurant={restaurant}
                  />
                ))
              }

            </div>
          )
        }

      </div>

    </div>
  );
}

export default Home;