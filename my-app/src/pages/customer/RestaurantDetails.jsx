import {

  useEffect,
  useState

} from "react";

import {

  useParams

} from "react-router-dom";

import axios
from "axios";

function RestaurantDetails() {

  /* =========================
     GET PARAM
  ========================= */

  const params =
    useParams();

  const merchantId =
    params.id;

  console.log(
    "Merchant ID:",
    merchantId
  );

  /* =========================
     STATES
  ========================= */

  const [foods, setFoods] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =========================
     FETCH FOODS
  ========================= */

  useEffect(() => {

    if (merchantId) {

      fetchFoods();
    }

  }, [merchantId]);

  const fetchFoods =
    async () => {

      try {

        const response =
          await axios.get(

            `http://localhost:5000/api/food/foods/${merchantId}`
          );

        console.log(
          response.data
        );

        setFoods(
          response.data.foods
        );

      } catch (error) {

        console.log(
          "Food Fetch Error:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div
      style={{
        padding: "40px"
      }}
    >

      <h1>
        Restaurant Foods
      </h1>

      {

        loading ? (

          <h2>
            Loading...
          </h2>

        ) : foods.length === 0 ? (

          <h2>
            No Foods Available
          </h2>

        ) : (

          foods.map((food) => (

            <div

              key={food._id}

              style={{
                background: "white",
                padding: "20px",
                marginBottom: "20px",
                borderRadius: "12px"
              }}
            >

              <img

                src={
                  food.image

                  ? `http://localhost:5000${food.image}`

                  : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"
                }

                alt={food.name}

                style={{
                  width: "300px",
                  borderRadius: "10px"
                }}
              />

              <h2>
                {food.name}
              </h2>

              <p>
                {food.category}
              </p>

              <p>
                {food.description}
              </p>

              <h3>
                ₹ {food.price}
              </h3>

            </div>
          ))
        )
      }

    </div>
  );
}

export default RestaurantDetails;