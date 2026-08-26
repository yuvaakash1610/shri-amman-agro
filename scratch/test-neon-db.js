const { Pool } = require('pg');
const { initializeDatabase } = require('../backend/config/db');

// Temporarily set process.env.DATABASE_URL
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_GuaFcVvTs6w9@ep-raspy-recipe-ax8z9jx5.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function testNeon() {
  console.log('Testing Neon connection and initializing database schema...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to Neon PostgreSQL successfully! Server time:', res.rows[0].now);
    
    // Now run schema initialization
    const { initializeDatabase } = require('../backend/config/db');
    await initializeDatabase();
    console.log('✅ All database tables and indexes provisioned on Neon successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection or schema error:', err);
    process.exit(1);
  }
}

testNeon();
