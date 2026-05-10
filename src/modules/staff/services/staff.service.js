import Staff from "../model/staff.model.js";

/* ================= INR FORMATTER ================= */

const formatINR = (num) => {

  return new Intl.NumberFormat(
    "en-IN",

    {
      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0
    }
  ).format(num || 0);
};

/* ================= GET STAFF DATA ================= */

const getStaffData = async (
  store_id
) => {

  /* ================= FILTER ================= */

  const filter = {

    isDeleted: false
  };

  // MULTI STORE FILTER
  if (store_id) {

    filter.store_id =
      store_id;
  }

  /* ================= FETCH STAFF ================= */

  const staffDocs =
    await Staff.find(filter)

      .sort({
        createdAt: -1
      })

      .lean();

  /* ================= AGGREGATED STATS ================= */

  const statsAgg =
    await Staff.aggregate([

      {
        $match: filter
      },

      {
        $group: {

          _id: null,

          totalStaff: {
            $sum: 1
          },

          active: {
            $sum: {

              $cond: [
                {
                  $eq: [
                    "$status",
                    "Active"
                  ]
                },

                1,

                0
              ]
            }
          },

          inactive: {
            $sum: {

              $cond: [
                {
                  $eq: [
                    "$status",
                    "Inactive"
                  ]
                },

                1,

                0
              ]
            }
          },

          totalOrders: {
            $sum: "$orders"
          },

          totalSales: {
            $sum: "$sales"
          },

          adminCount: {
            $sum: {

              $cond: [
                {
                  $eq: [
                    "$role",
                    "Admin"
                  ]
                },

                1,

                0
              ]
            }
          },

          managerCount: {
            $sum: {

              $cond: [
                {
                  $eq: [
                    "$role",
                    "Manager"
                  ]
                },

                1,

                0
              ]
            }
          },

          cashierCount: {
            $sum: {

              $cond: [
                {
                  $eq: [
                    "$role",
                    "Cashier"
                  ]
                },

                1,

                0
              ]
            }
          },

          vendorCount: {
            $sum: {

              $cond: [
                {
                  $eq: [
                    "$role",
                    "Vendor"
                  ]
                },

                1,

                0
              ]
            }
          }
        }
      }
    ]);

  /* ================= FALLBACK ================= */

  const statsData =
    statsAgg[0] || {

      totalStaff: 0,

      active: 0,

      inactive: 0,

      totalOrders: 0,

      totalSales: 0,

      adminCount: 0,

      managerCount: 0,

      cashierCount: 0,

      vendorCount: 0
    };

  /* ================= PERFORMANCE ================= */

  const avgPerformance =

    statsData.totalOrders > 0

      ? (
          statsData.totalSales /
          statsData.totalOrders
        ).toFixed(1)

      : 0;

  /* ================= FORMAT STAFF ================= */

  const staff =
    staffDocs.map((staff) => ({

      ...staff,

      salesFormatted:
        formatINR(staff.sales),

      avgOrderFormatted:
        formatINR(staff.avgOrder),

      roleColor:
        getRoleColor(staff.role),

      joinedDate:
        new Date(
          staff.createdAt
        ).toLocaleDateString(
          "en-IN"
        ),

      lastLoginFormatted:
        staff.lastLogin

          ? new Date(
              staff.lastLogin
            ).toLocaleString(
              "en-IN"
            )

          : "Never"
    }));

  /* ================= FINAL RESPONSE ================= */

  return {

    stats: {

      totalStaff:
        statsData.totalStaff,

      active:
        statsData.active,

      inactive:
        statsData.inactive,

      totalOrders:
        statsData.totalOrders,

      totalSales:
        statsData.totalSales,

      totalSalesFormatted:
        formatINR(
          statsData.totalSales
        ),

      avgPerformance,

      roles: {

        admin:
          statsData.adminCount,

        manager:
          statsData.managerCount,

        cashier:
          statsData.cashierCount,

        vendor:
          statsData.vendorCount
      }
    },

    staff
  };
};

/* ================= ROLE COLORS ================= */

const getRoleColor = (
  role
) => {

  switch (role) {

    case "Admin":
      return "#dc2626";

    case "Manager":
      return "#2563eb";

    case "Cashier":
      return "#16a34a";

    case "Vendor":
      return "#9333ea";

    default:
      return "#64748b";
  }
};

export default getStaffData;