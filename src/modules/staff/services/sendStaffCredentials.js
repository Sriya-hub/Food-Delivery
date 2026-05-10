import axios from "axios";

/* ================= SEND STAFF EMAIL ================= */

const sendStaffCredentials = async ({
  name,
  email,
  username,
  password,
  role
}) => {

  try {

    const response = await axios.post(

      "https://api.brevo.com/v3/smtp/email",

      {
        sender: {
          name: "Omni Retail",
          email: "svasu18604@gmail.com"
        },

        to: [
          {
            email
          }
        ],

        subject: `Your ${role} Account Credentials`,

        htmlContent: `

          <div style="
            background:#f8fafc;
            padding:40px;
            font-family:Arial;
          ">

            <div style="
              max-width:600px;
              margin:auto;
              background:white;
              border-radius:18px;
              padding:35px;
            ">

              <h2 style="
                color:#0f172a;
              ">
                Welcome ${name}
              </h2>

              <p>
                Your staff account has been created successfully.
              </p>

              <div style="
                background:#f1f5f9;
                padding:20px;
                border-radius:14px;
                margin-top:20px;
              ">

                <p>
                  <strong>Role:</strong>
                  ${role}
                </p>

                <p>
                  <strong>Username:</strong>
                  ${username}
                </p>

                <p>
                  <strong>Password:</strong>
                  ${password}
                </p>

              </div>

              <p style="
                margin-top:20px;
                color:#dc2626;
                font-weight:600;
              ">
                Please change your password after first login.
              </p>

            </div>

          </div>
        `
      },

      {
        headers: {

          accept: "application/json",

          "api-key": process.env.BREVO_API_KEY,

          "content-type": "application/json"
        }
      }
    );

    console.log(
      "✅ Brevo Email Sent:",
      response.data
    );

  } catch (err) {

    console.error(
      "❌ BREVO EMAIL ERROR:",
      err.response?.data ||
      err.message
    );

    throw err;
  }
};

export default sendStaffCredentials;