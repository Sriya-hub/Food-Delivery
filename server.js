import dotenv from "dotenv";

/* ======================================
   LOAD ENV
====================================== */

dotenv.config();

/* ======================================
   IMPORTS
====================================== */

import app from "./src/app.js";

import connectDB
from "./src/config/db.js";

/* ======================================
   PORT
====================================== */

const PORT =
  process.env.PORT || 5000;

/* ======================================
   START SERVER
====================================== */

const startServer =
  async () => {

    try {

      /* ===============================
         CONNECT DATABASE
      =============================== */

      await connectDB();

      console.log(
        "✅ MongoDB Connected"
      );

      /* ===============================
         START EXPRESS
      =============================== */

      const server =
        app.listen(
          PORT,
          () => {

            console.log(
              `🚀 Server running on port ${PORT}`
            );
          }
        );

      /* ===============================
         UNHANDLED REJECTION
      =============================== */

      process.on(

        "unhandledRejection",

        (err) => {

          console.error(
            "❌ Unhandled Rejection:"
          );

          console.error(
            err.message
          );

          shutdown(server);
        }
      );

      /* ===============================
         UNCAUGHT EXCEPTION
      =============================== */

      process.on(

        "uncaughtException",

        (err) => {

          console.error(
            "❌ Uncaught Exception:"
          );

          console.error(
            err.message
          );

          process.exit(1);
        }
      );

      /* ===============================
         TERMINATE
      =============================== */

      process.on(

        "SIGINT",

        () => {

          console.log(
            "⚠️ Server Stopped"
          );

          shutdown(server);
        }
      );

    } catch (err) {

      console.error(
        "❌ Server Failed"
      );

      console.error(
        err.message
      );

      process.exit(1);
    }
  };

/* ======================================
   SHUTDOWN
====================================== */

const shutdown = (
  server
) => {

  server.close(() => {

    console.log(
      "🧹 Server Closed"
    );

    process.exit(1);
  });
};

/* ======================================
   RUN
====================================== */

startServer();