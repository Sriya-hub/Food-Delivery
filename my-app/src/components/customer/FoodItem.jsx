import "./FoodItem.css";

function FoodItem(props) {
  return (
    <div className="food-item">

      <img
        src={props.image}
        alt="food"
        className="food-image"
      />

      <div className="food-details">

        <h2>{props.name}</h2>

        <p>{props.description}</p>

        <div className="food-bottom">

          <span className="food-price">
            ₹ {props.price}
          </span>

          <button className="add-btn">
            Add
          </button>

        </div>

      </div>

    </div>
  );
}

export default FoodItem;