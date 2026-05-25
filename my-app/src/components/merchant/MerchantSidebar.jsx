import "./MerchantSidebar.css";

function MerchantSidebar({
  activeTab,
  setActiveTab
}) {

  const menus = [

    {
      id:"foods",
      label:"Food Items"
    },

    {
      id:"orders",
      label:"Orders"
    },

    {
      id:"analytics",
      label:"Analytics"
    },

    {
      id:"settings",
      label:"Settings"
    }

  ];

  return (

    <div className="merchant-sidebar">

      <h2>
        OmniRetail
      </h2>

      <ul>

        {
          menus.map((menu) => (

            <li
              key={menu.id}

              className={
                activeTab === menu.id
                ? "active"
                : ""
              }

              onClick={() =>
                setActiveTab(menu.id)
              }
            >

              {menu.label}

            </li>
          ))
        }

      </ul>

    </div>
  );
}

export default MerchantSidebar;