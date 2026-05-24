import "./MerchantRegistration.css";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

function MerchantRegistration() {

  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [restaurantName, setRestaurantName] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [restaurantAddress, setRestaurantAddress] =
    useState("");

  const [restaurantType, setRestaurantType] =
    useState("");

  const [openingTime, setOpeningTime] =
    useState("");

  const [closingTime, setClosingTime] =
    useState("");

  const [restaurantImage, setRestaurantImage] =
    useState(null);

  /* =========================
     HANDLE SUBMIT
  ========================= */

  const handleSubmit = async () => {

    /* VALIDATION */

    if (
      !restaurantName ||
      !phoneNumber ||
      !restaurantAddress ||
      !restaurantType ||
      !openingTime ||
      !closingTime
    ) {

      alert(
        "Please fill all fields"
      );

      return;
    }

    try {

      /* GET USER */

      const user =
        JSON.parse(
          localStorage.getItem("user")
        );

      /* UPDATE USER */

      user.restaurantName =
        restaurantName;

      user.phoneNumber =
        phoneNumber;

      user.restaurantAddress =
        restaurantAddress;

      user.restaurantType =
        restaurantType;

      user.openingTime =
        openingTime;

      user.closingTime =
        closingTime;

      user.registrationCompleted =
        true;

      user.isApproved =
        false;

      /* SAVE UPDATED USER */

      localStorage.setItem(
        "user",

        JSON.stringify(user)
      );

      /* SUCCESS */

      alert(
        "Registration Submitted For Review"
      );

      /* REDIRECT */

      navigate(
        "/waiting-approval"
      );

    } catch (error) {

      console.log(error);

      alert(
        "Something went wrong"
      );
    }
  };

  return (
    <div className="merchant-page">

      {/* LEFT SIDE */}

      <div className="merchant-left">

        <div className="merchant-overlay">

          <h1>
            Become a Partner
          </h1>

          <p>
            Join OmniRetail and grow
            your restaurant business
            using smart delivery,
            analytics and hospitality
            management tools.
          </p>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="merchant-right">

        <div className="merchant-box">

          <h1>
            Restaurant Registration
          </h1>

          <p className="merchant-subtitle">
            Complete your merchant onboarding
          </p>

          {/* RESTAURANT NAME */}

          <input
            type="text"
            placeholder="Restaurant Name"

            value={restaurantName}

            onChange={(e) =>
              setRestaurantName(
                e.target.value
              )
            }
          />

          {/* PHONE */}

          <input
            type="text"
            placeholder="Phone Number"

            value={phoneNumber}

            onChange={(e) =>
              setPhoneNumber(
                e.target.value
              )
            }
          />

          {/* ADDRESS */}

          <textarea
            placeholder="Restaurant Address"

            value={restaurantAddress}

            onChange={(e) =>
              setRestaurantAddress(
                e.target.value
              )
            }
          ></textarea>

          {/* TYPE */}

          <select
            value={restaurantType}

            onChange={(e) =>
              setRestaurantType(
                e.target.value
              )
            }
          >

            <option value="">
              Select Restaurant Type
            </option>

            <option value="veg">
              Pure Veg
            </option>

            <option value="nonveg">
              Non Veg
            </option>

            <option value="both">
              Veg & Non Veg
            </option>

          </select>

          {/* TIMINGS */}

          <div className="time-row">

            <div className="time-box">

              <label>
                Opening Time
              </label>

              <input
                type="time"

                value={openingTime}

                onChange={(e) =>
                  setOpeningTime(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="time-box">

              <label>
                Closing Time
              </label>

              <input
                type="time"

                value={closingTime}

                onChange={(e) =>
                  setClosingTime(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* IMAGE */}

          <div className="upload-section">

            <label>
              Upload Restaurant Image
            </label>

            <input
              type="file"

              onChange={(e) =>
                setRestaurantImage(
                  e.target.files[0]
                )
              }
            />

          </div>

          {/* BUTTON */}

          <button
            className="merchant-btn"

            onClick={handleSubmit}
          >
            Submit Registration
          </button>

        </div>

      </div>

    </div>
  );
}

export default MerchantRegistration;