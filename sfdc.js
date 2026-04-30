require("dotenv").config();
const jsforce = require("jsforce");

const conn = new jsforce.Connection({
  loginUrl: process.env.SF_LOGIN_URL,
});

async function login() {
  await conn.login(
    process.env.SF_USERNAME,
    process.env.SF_PASSWORD
  );
  console.log("✅ Connected to Salesforce");
}

module.exports = { conn, login };