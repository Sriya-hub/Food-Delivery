import "./Signup.css";

import { Link } from "react-router-dom";

import { useState } from "react";

import axios from "axios";

function Signup() {

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("");

  /* =========================
     HANDLE SIGNUP
  ========================= */

  const handleSignup =
    async () => {

      /* VALIDATION */

      if (
        !name ||
        !email ||
        !password ||
        !role
      ) {

        alert(
          "Please fill all fields"
        );

        return;
      }

      try {

        const response =
          await axios.post(

            "http://localhost:5000/api/auth/signup",

            {
              name,
              email,
              password,
              role,
            }
          );

        /* SUCCESS */

        alert(
          "Signup Successful"
        );

        console.log(
          response.data
        );

        /* CLEAR FORM */

        setName("");

        setEmail("");

        setPassword("");

        setRole("");

      } catch (error) {

        console.log(error);

        /* ERROR HANDLING */

        if (error.response) {

          alert(
            error.response.data.message
          );

        } else {

          alert(
            "Server Error"
          );
        }
      }
    };

  return (
    <div className="signup-page">

      {/* LEFT SIDE */}

      <div className="signup-left">

        <div className="overlay">

          <h1>Join OmniRetail</h1>

          <p>
            Food Delivery,
            Restaurant Management
            and Smart Hospitality
            Platform
          </p>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="signup-right">

        <div className="signup-box">

          <h1>Create Account</h1>

          <p className="subtitle">
            Signup to continue
          </p>

          {/* NAME */}

          <input
            type="text"
            placeholder="Full Name"

            value={name}

            onChange={(e) =>
              setName(e.target.value)
            }
          />

          {/* EMAIL */}

          <input
            type="email"
            placeholder="Email Address"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Password"

            value={password}

            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {/* ROLE */}

          <select
            value={role}

            onChange={(e) =>
              setRole(e.target.value)
            }
          >

            <option value="">
              Select Role
            </option>

            <option value="customer">
              Customer
            </option>

            <option value="merchant">
              Merchant
            </option>

            <option value="delivery">
              Delivery Boy
            </option>

          </select>

          {/* BUTTON */}

          <button
            className="signup-btn"

            onClick={handleSignup}
          >
            Create Account
          </button>

          {/* LOGIN LINK */}

          <p className="login-text">

            Already have an account?

            <Link to="/login">
              {" "}Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Signup;