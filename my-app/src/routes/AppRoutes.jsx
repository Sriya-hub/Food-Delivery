import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/customer/Home";
import RestaurantDetails from "../pages/customer/RestaurantDetails";

function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/restaurant"
          element={<RestaurantDetails />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;