const dotenv = require('dotenv');
dotenv.config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  try {
    const sql = 'UPDATE customers SET customer_name = $1, phone_number = $2, aadhaar_number = $3, address = $4, customer_type = $5, email = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING id, customer_id, customer_name, phone_number, aadhaar_number, address, customer_type, email, created_at, updated_at';
    const values = ['Ravi Kumar Updated', '9876543211', '123412341234', 'Village Markapur Updated', 'Farmer', 'ravi@example.com', 1];
    const res = await pool.query(sql, values);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
})();
