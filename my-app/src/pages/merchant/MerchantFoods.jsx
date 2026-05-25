import { useEffect, useState } from "react";

import axios from "axios";

import "./MerchantFoods.css";

function MerchantFoods() {

  /* =========================
     STATES
  ========================= */

  const [foods, setFoods] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [foodData, setFoodData] =
    useState({

      name: "",

      category: "",

      price: "",

      stock: "",

      description: "",

      available: true,

      image: null
    });

  /* =========================
     FETCH FOODS
  ========================= */

  useEffect(() => {

    fetchFoods();

  }, []);

  const fetchFoods = async () => {

    try {

      const merchantId =
        localStorage.getItem(
          "merchantId"
        );

      const response =
        await axios.get(

          `http://localhost:5000/api/merchant-food/foods/${merchantId}`
        );

      setFoods(
        response.data.foods
      );

    } catch (error) {

      console.log(error);
    }
  };

  /* =========================
     HANDLE INPUT
  ========================= */

  const handleChange = (e) => {

    const { name, value } =
      e.target;

    setFoodData({

      ...foodData,

      [name]: value
    });
  };

  /* =========================
     HANDLE IMAGE
  ========================= */

  const handleImageChange = (e) => {

    setFoodData({

      ...foodData,

      image:
        e.target.files[0]
    });
  };

  /* =========================
     SUBMIT FOOD
  ========================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const merchantId =
        localStorage.getItem(
          "merchantId"
        );

      const formData =
        new FormData();

      formData.append(
        "merchantId",
        merchantId
      );

      formData.append(
        "name",
        foodData.name
      );

      formData.append(
        "category",
        foodData.category
      );

      formData.append(
        "description",
        foodData.description
      );

      formData.append(
        "price",
        foodData.price
      );

      formData.append(
        "stock",
        foodData.stock
      );

      formData.append(
        "available",
        foodData.available
      );

      formData.append(
        "image",
        foodData.image
      );

      const response =
        await axios.post(

          "http://localhost:5000/api/merchant-food/add-food",

          formData,

          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );

      console.log(
        response.data
      );

      /* REFRESH TABLE */

      fetchFoods();

      /* CLOSE MODAL */

      setShowForm(false);

      /* RESET FORM */

      setFoodData({

        name: "",

        category: "",

        price: "",

        stock: "",

        description: "",

        available: true,

        image: null
      });

    } catch (error) {

      console.log(error);
    }
  };

  /* =========================
     DELETE FOOD
  ========================= */

  const deleteFood = async (
    id
  ) => {

    try {

      await axios.delete(

        `http://localhost:5000/api/merchant-food/delete-food/${id}`
      );

      fetchFoods();

    } catch (error) {

      console.log(error);
    }
  };

  return (

    <div className="merchant-foods">

      {/* =========================
          HEADER
      ========================= */}

      <div className="foods-header">

        <div>

          <h1>
            Food Management
          </h1>

          <p>
            Manage all restaurant food items
          </p>

        </div>

        <button
          className="add-food-btn"

          onClick={() =>
            setShowForm(true)
          }
        >

          + Add Food

        </button>

      </div>

      {/* =========================
          ADD FOOD MODAL
      ========================= */}

      {
        showForm && (

          <div className="food-modal-overlay">

            <div className="food-modal">

              <div className="modal-header">

                <h2>
                  Add Food Item
                </h2>

                <button
                  className="close-btn"

                  onClick={() =>
                    setShowForm(false)
                  }
                >

                  ✕

                </button>

              </div>

              <form
                className="food-form"

                onSubmit={
                  handleSubmit
                }
              >

                <input
                  type="text"

                  name="name"

                  placeholder="Food Name"

                  value={
                    foodData.name
                  }

                  onChange={
                    handleChange
                  }

                  required
                />

                <input
                  type="text"

                  name="category"

                  placeholder="Category"

                  value={
                    foodData.category
                  }

                  onChange={
                    handleChange
                  }

                  required
                />

                <input
                  type="number"

                  name="price"

                  placeholder="Price"

                  value={
                    foodData.price
                  }

                  onChange={
                    handleChange
                  }

                  required
                />

                <input
                  type="number"

                  name="stock"

                  placeholder="Stock Quantity"

                  value={
                    foodData.stock
                  }

                  onChange={
                    handleChange
                  }

                  required
                />

                <textarea
                  name="description"

                  placeholder="Food Description"

                  value={
                    foodData.description
                  }

                  onChange={
                    handleChange
                  }
                />

                <div className="availability-box">

                  <label>

                    <input
                      type="checkbox"

                      checked={
                        foodData.available
                      }

                      onChange={() =>

                        setFoodData({

                          ...foodData,

                          available:
                            !foodData.available
                        })
                      }
                    />

                    Available

                  </label>

                </div>

                <input
                  type="file"

                  accept="image/*"

                  onChange={
                    handleImageChange
                  }

                  required
                />

                {
                  foodData.image && (

                    <img

                      src={
                        URL.createObjectURL(
                          foodData.image
                        )
                      }

                      alt="Preview"

                      className="preview-image"
                    />
                  )
                }

                <button
                  type="submit"

                  className="submit-food-btn"
                >

                  Save Food

                </button>

              </form>

            </div>

          </div>
        )
      }

      {/* =========================
          FOOD TABLE
      ========================= */}

      <div className="foods-table-container">

        <table className="foods-table">

          <thead>

            <tr>

              <th>
                Image
              </th>

              <th>
                Food Name
              </th>

              <th>
                Category
              </th>

              <th>
                Price
              </th>

              <th>
                Stock
              </th>

              <th>
                Status
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {
              foods.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"

                    className="empty-state"
                  >

                    No food items found

                  </td>

                </tr>

              ) : (

                foods.map((food) => (

                  <tr key={food._id}>

                    <td>

                      <img

                        src={
                          `http://localhost:5000${food.image}`
                        }

                        alt={food.name}
                      />

                    </td>

                    <td>
                      {food.name}
                    </td>

                    <td>
                      {food.category}
                    </td>

                    <td>
                      ₹ {food.price}
                    </td>

                    <td>
                      {food.stock}
                    </td>

                    <td>

                      <span
                        className={
                          food.available
                          ? "status available"
                          : "status unavailable"
                        }
                      >

                        {
                          food.available
                          ? "Available"
                          : "Unavailable"
                        }

                      </span>

                    </td>

                    <td>

                      <button>
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteFood(
                            food._id
                          )
                        }
                      >

                        Delete

                      </button>

                    </td>

                  </tr>
                ))
              )
            }

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default MerchantFoods;