const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'shri_amman_agro', password: 'root', port: 5432 });

async function run() {
  try {
    await pool.query('SELECT 1');
    console.log('DB connected OK');

    // Try inserting a company with a GSTIN that might already exist
    const result = await pool.query(
      `INSERT INTO companies (company_name, contact_person, phone, email, address, gstin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      ['akash', 'Yuvaakash K', '09994589432', 'yuvaakash16@gmail.com', 'Test Address', '22AAAAA0000A1Z5']
    );
    console.log('Insert success:', JSON.stringify(result.rows[0]));

    // Clean up
    await pool.query('DELETE FROM companies WHERE company_name = $1', ['akash']);
    console.log('Cleaned up test row');
  } catch (err) {
    console.error('Error:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.constraint) console.error('Constraint:', err.constraint);
    if (err.code) console.error('PG Error Code:', err.code);
  } finally {
    await pool.end();
  }
}

run();
