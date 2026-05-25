import "./Login.css";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useState
} from "react";

import axios from "axios";

function Login() {

  const navigate =
    useNavigate();

  /* =========================
     STATES
  ========================= */

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* =========================
     HANDLE LOGIN
  ========================= */

  const handleLogin =
    async () => {

      /* VALIDATION */

      if (
        !email ||
        !password
      ) {

        alert(
          "Please fill all fields"
        );

        return;
      }

      try {

        setLoading(true);

        const response =
          await axios.post(

            "http://localhost:5000/api/auth/login",

            {
              email,
              password
            }
          );

        /* =========================
           RESPONSE DATA
        ========================= */

        const user =
          response.data.user;

        const token =
          response.data.token;

        /* =========================
           STORE AUTH DATA
        ========================= */

        localStorage.setItem(
          "token",
          token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        /* =========================
           SAVE USER ID
        ========================= */

        localStorage.setItem(
          "userId",
          user._id
        );

        /* =========================
           SAVE ROLE
        ========================= */

        localStorage.setItem(
          "role",
          user.role
        );

        /* =========================
           SAVE MERCHANT ID
        ========================= */

        if (
          user.role === "merchant"
        ) {

          localStorage.setItem(

            "merchantId",

            user._id
          );
        }

        alert(
          "Login Successful"
        );

        /* =========================
           ROLE BASED NAVIGATION
        ========================= */

        /* CUSTOMER */

        if (
          user.role === "customer"
        ) {

          navigate("/");
        }

        /* DELIVERY */

        else if (
          user.role === "delivery"
        ) {

          navigate(
            "/delivery/dashboard"
          );
        }

        /* ADMIN */

        else if (
          user.role === "admin"
        ) {

          navigate(
            "/admin/dashboard"
          );
        }

        /* MERCHANT */

        else if (
          user.role === "merchant"
        ) {

          /* FIRST TIME REGISTRATION */

          if (
            !user.registrationCompleted
          ) {

            navigate(
              "/merchant-registration"
            );
          }

          /* WAITING APPROVAL */

          else if (
            !user.isApproved
          ) {

            navigate(
              "/waiting-approval"
            );
          }

          /* APPROVED */

          else {

            navigate(
              "/merchant/dashboard"
            );
          }
        }

      } catch (error) {

        console.log(error);

        if (
          error.response
        ) {

          alert(

            error.response
              .data
              .message
          );

        } else {

          alert(
            "Server Error"
          );
        }

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="login-page">

      {/* =========================
          LEFT SIDE
      ========================= */}

      <div className="login-left">

        <div className="login-overlay">

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to continue
            your OmniRetail journey
          </p>

        </div>

      </div>

      {/* =========================
          RIGHT SIDE
      ========================= */}

      <div className="login-right">

        <div className="login-box">

          <h1>
            Login
          </h1>

          <p className="login-subtitle">

            Access your account

          </p>

          {/* EMAIL */}

          <input
            type="email"

            placeholder="Enter Email"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          {/* PASSWORD */}

          <input
            type="password"

            placeholder="Enter Password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          {/* LOGIN BUTTON */}

          <button

            className="login-submit-btn"

            onClick={handleLogin}

            disabled={loading}
          >

            {
              loading
              ? "Logging In..."
              : "Login"
            }

          </button>

          {/* SIGNUP LINK */}

          <p className="signup-link">

            Don't have an account?

            <Link to="/signup">

              {" "}Signup

            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;