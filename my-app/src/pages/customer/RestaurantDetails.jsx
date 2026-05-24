import "./RestaurantDetails.css";

import Header from "../../components/customer/Header";
import FoodItem from "../../components/customer/FoodItem";

function RestaurantDetails() {

  const foods = [
    {
      id: 1,
      name: "Chicken Burger",
      description: "Crispy chicken burger with cheese",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    },

    {
      id: 2,
      name: "French Fries",
      description: "Hot crispy potato fries",
      price: 99,
      image:
        "https://images.unsplash.com/photo-1576107232684-1279f390859f",
    },

    {
      id: 3,
      name: "Cold Coffee",
      description: "Refreshing chilled coffee",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1517701604599-bb29b565090c",
    },
  ];

  return (
    <div className="restaurant-details-page">

      <Header />

      <div className="restaurant-content">

        <div className="restaurant-banner">

          <h1>Burger House</h1>

          <p>⭐ 4.5 • 25 mins • Fast Food</p>

        </div>

        <div className="menu-section">

          <h2>Popular Items</h2>

          {foods.map((food) => (
            <FoodItem
              key={food.id}
              name={food.name}
              description={food.description}
              price={food.price}
              image={food.image}
            />
          ))}

        </div>

      </div>

    </div>
  );
}

export default RestaurantDetails;