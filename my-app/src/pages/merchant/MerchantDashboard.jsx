import { useState } from "react";

import "./MerchantDashboard.css";

import MerchantSidebar
from "../../components/merchant/MerchantSidebar";

import MerchantTopbar
from "../../components/merchant/MerchantTopbar";

import MerchantFoods
from "./MerchantFoods";

import MerchantOrders
from "./MerchantOrders";

import MerchantAnalytics
from "./MerchantAnalytics";

import MerchantSettings
from "./MerchantSettings";

function MerchantDashboard() {

  const [activeTab, setActiveTab] =
    useState("foods");

  const renderContent = () => {

    switch (activeTab) {

      case "foods":
        return <MerchantFoods />;

      case "orders":
        return <MerchantOrders />;

      case "analytics":
        return <MerchantAnalytics />;

      case "settings":
        return <MerchantSettings />;

      default:
        return <MerchantFoods />;
    }
  };

  return (

    <div className="merchant-dashboard">

      <MerchantSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="merchant-main">

        <MerchantTopbar />

        <div className="merchant-content">

          {renderContent()}

        </div>

      </div>

    </div>
  );
}

export default MerchantDashboard;