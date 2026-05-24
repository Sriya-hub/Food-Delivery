import { BrowserRouter, Routes, Route } from "react-router-dom";

/* =========================
   CUSTOMER PAGES
========================= */

import Home from "../pages/customer/Home";

import RestaurantDetails from "../pages/customer/RestaurantDetails";

import Cart from "../pages/customer/Cart";

import Checkout from "../pages/customer/Checkout";

import OrderSuccess from "../pages/customer/OrderSuccess";

/* =========================
   AUTH PAGES
========================= */

import Login from "../pages/auth/Login";

import Signup from "../pages/auth/Signup";

/* =========================
   MERCHANT PAGES
========================= */

import MerchantRegistration from "../pages/merchant/MerchantRegistration";

import WaitingApproval from "../pages/merchant/WaitingApproval";

import MerchantDashboard from "../pages/merchant/MerchantDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

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

        <Route
          path="/restaurant"
          element={<RestaurantDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
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
          element={<MerchantRegistration />}
        />

        <Route
          path="/waiting-approval"
          element={<WaitingApproval />}
        />

        <Route
          path="/merchant/dashboard"
          element={<MerchantDashboard />}
        />

        <Route
  path="/admin/dashboard"
  element={<AdminDashboard />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;