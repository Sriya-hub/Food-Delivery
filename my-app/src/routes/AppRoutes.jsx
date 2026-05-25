import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

/* =========================
   CUSTOMER PAGES
========================= */

import Home
from "../pages/customer/Home";

import RestaurantDetails
from "../pages/customer/RestaurantDetails";

import Cart
from "../pages/customer/Cart";

import Checkout
from "../pages/customer/Checkout";

import OrderSuccess
from "../pages/customer/OrderSuccess";

/* =========================
   AUTH PAGES
========================= */

import Login
from "../pages/auth/Login";

import Signup
from "../pages/auth/Signup";

/* =========================
   MERCHANT PAGES
========================= */

import MerchantRegistration
from "../pages/merchant/MerchantRegistration";

import WaitingApproval
from "../pages/merchant/WaitingApproval";

import MerchantDashboard
from "../pages/merchant/MerchantDashboard";

/* =========================
   ADMIN PAGES
========================= */

import AdminDashboard
from "../pages/admin/AdminDashboard";

/* =========================
   CUSTOMER COMPONENTS
========================= */

import RestaurantCard
from "../components/customer/RestaurantCard";

function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =========================
            CUSTOMER ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* =========================
            RESTAURANT DETAILS
        ========================= */}

        <Route
          path="/restaurant/:merchantId"
          element={
            <RestaurantDetails />
          }
        />

        {/* =========================
            CART
        ========================= */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* =========================
            CHECKOUT
        ========================= */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        {/* =========================
            ORDER SUCCESS
        ========================= */}

        <Route
          path="/order-success"
          element={
            <OrderSuccess />
          }
        />

        {/* =========================
            AUTH ROUTES
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* =========================
            MERCHANT ROUTES
        ========================= */}

        <Route
          path="/merchant-registration"
          element={
            <MerchantRegistration />
          }
        />

        <Route
          path="/waiting-approval"
          element={
            <WaitingApproval />
          }
        />

        <Route
          path="/merchant/dashboard"
          element={
            <MerchantDashboard />
          }
        />

        {/* =========================
            ADMIN ROUTES
        ========================= */}

        <Route
          path="/admin/dashboard"
          element={
            <AdminDashboard />
          }
        />

        {/* =========================
            FALLBACK ROUTE
        ========================= */}

        <Route
          path="*"
          element={

            <div
              style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                background: "#f8f9fb",
              }}
            >

              <h1>
                404
              </h1>

              <p>
                Page Not Found
              </p>

            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;