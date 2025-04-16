const pg = require("pg");
require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const db = new pg.Client({ // new pg
  user: PGUSER,
  host: PGHOST,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  }
});


// async function getPgVersion() {    //to check whether the db is connected or not
//     const result = await db.query(`select version()`);
//     console.log(result);
//   }
  
//   getPgVersion();

db.query("SELECT NOW()")
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));

module.exports = {
  db
}
