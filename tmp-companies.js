const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'shri_amman_agro', password: 'root', port: 5432 });

async function run() {
  try {
    const result = await pool.query('SELECT company_id, company_name, gstin, email FROM companies ORDER BY company_id');
    console.log('Companies:', JSON.stringify(result.rows, null, 2));
    console.log('Total:', result.rows.length);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
run();
