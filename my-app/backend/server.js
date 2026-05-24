const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

/* DATABASE */

const connectDB =
  require("./config/db");

/* LOAD ENV */

dotenv.config();

/* CONNECT DATABASE */

connectDB();

/* EXPRESS APP */

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

/* =========================
   ROUTES
========================= */

/* SIGNUP ROUTES */

app.use(
  "/api/auth",

  require("./routes/signup.routes")
);

/* LOGIN ROUTES */

app.use(
  "/api/auth",

  require("./routes/login.routes")
);

/* =========================
   TEST ROUTE
========================= */

app.get("/", (req, res) => {

  res.send(
    "OmniRetail Backend Running"
  );
});

/* =========================
   SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server Running On Port ${PORT}`
  );
});