import Store from "../models/store.model.js";

/* ================= GET ALL ================= */
export const getAllStores = async () => {
  const stores = await Store.find().sort({ createdAt: -1 });
  return stores;
};

/* ================= GET ONE ================= */
export const getStoreById = async (id) => {
  const store = await Store.findById(id);

  if (!store) {
    throw new Error("Store not found");
  }

  return store;
};

/* ================= GENERATE STORE CODE ================= */
// 🔥 SAFE GENERATION (no duplicates in normal flow)
const generateStoreCode = async () => {
  const lastStore = await Store.findOne().sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastStore && lastStore.store_code) {
    const num = parseInt(lastStore.store_code.replace("STR", ""));
    nextNumber = num + 1;
  }

  return `STR${String(nextNumber).padStart(3, "0")}`;
};

/* ================= CREATE ================= */
export const createStore = async (data) => {
  // 🔥 GENERATE CODE HERE (NOT FROM FRONTEND)
  const store_code = await generateStoreCode();

  const store = await Store.create({
    store_code, // ✅ FIXED
    name: data.name,
    location: data.location,
    address: data.address,
    pincode: data.pincode,
    state: data.state
  });

  return store;
};

/* ================= UPDATE ================= */
export const updateStoreById = async (id, data) => {
  const updated = await Store.findByIdAndUpdate(
    id,
    {
      name: data.name,
      location: data.location,
      address: data.address,
      pincode: data.pincode,
      state: data.state
      // ❌ DO NOT update store_code
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!updated) {
    throw new Error("Store not found");
  }

  return updated;
};

/* ================= DELETE ================= */
export const deleteStoreById = async (id) => {
  const deleted = await Store.findByIdAndDelete(id);

  if (!deleted) {
    throw new Error("Store not found");
  }

  return { message: "Store deleted successfully" };
};