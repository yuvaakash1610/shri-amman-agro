const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'shri_amman_agro', password: 'root', port: 5432 });

async function run() {
  try {
    const result = await pool.query('SELECT id, full_name, email, role FROM users LIMIT 5');
    console.log('Users:', JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
run();
