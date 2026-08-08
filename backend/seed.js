const bcrypt = require('bcrypt');
const db = require('./config/db');

async function seedAdmin() {
  try {
    const password = 'password123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash;
    `;

    await db.query(query, ['System Admin', 'admin@shriammanagro.com', passwordHash, 'Admin']);
    console.log('Successfully seeded admin user with email: admin@shriammanagro.com and password: password123');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
