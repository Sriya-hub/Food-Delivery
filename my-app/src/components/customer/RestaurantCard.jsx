import "./RestaurantCard.css";

import { useNavigate } from "react-router-dom";

function RestaurantCard(props) {

  const navigate = useNavigate();

  return (
    <div
      className="restaurant-card"
      onClick={() => navigate("/restaurant")}
    >

      <img
        src={props.image}
        alt="food"
        className="restaurant-image"
      />

      <div className="restaurant-details">

        <h2>{props.name}</h2>

        <p>{props.category}</p>

        <div className="restaurant-info">
          <span>⭐ {props.rating}</span>
          <span>{props.time}</span>
        </div>

      </div>

    </div>
  );
}

export default RestaurantCard;