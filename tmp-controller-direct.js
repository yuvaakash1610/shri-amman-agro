// Direct test of the createCompany logic
process.env.DB_USER = 'postgres';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'shri_amman_agro';
process.env.DB_PASSWORD = 'root';
process.env.DB_PORT = '5432';

const db = require('./backend/config/db');

async function run() {
  const companyName = 'akash';
  const contactPerson = 'Yuvaakash K';
  const phone = '09994589432';
  const email = 'yuvaakash16@gmail.com';
  const address = 'Test Address';
  const gstin = '1Z5';

  console.log('Testing INSERT...');
  try {
    const result = await db.query(
      `INSERT INTO companies (company_name, contact_person, phone, email, address, gstin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING company_id, company_name, contact_person, phone, email, address, gstin, created_at, updated_at`,
      [
        companyName.trim(),
        contactPerson ? contactPerson.trim() : null,
        phone ? phone.trim() : null,
        email ? email.trim() : null,
        address.trim(),
        gstin ? gstin.trim() : null
      ]
    );
    console.log('Success:', JSON.stringify(result.rows[0], null, 2));
    await db.query('DELETE FROM companies WHERE company_name = $1', ['akash']);
  } catch (error) {
    console.error('Create company error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error stack:', error.stack);
  }

  // Try with empty gstin
  console.log('\nTesting with empty gstin...');
  try {
    const result2 = await db.query(
      `INSERT INTO companies (company_name, contact_person, phone, email, address, gstin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING company_id, company_name`,
      ['akash2', null, null, null, 'Test Address', null]
    );
    console.log('Success (null gstin):', JSON.stringify(result2.rows[0]));
    await db.query('DELETE FROM companies WHERE company_name = $1', ['akash2']);
  } catch (error) {
    console.error('Error (null gstin):', error.message);
  }

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
