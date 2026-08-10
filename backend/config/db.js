const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const initializeDatabase = async () => {
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Staff');
      END IF;
    END
    $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role user_role NOT NULL DEFAULT 'Staff',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      customer_id VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(50) NOT NULL,
      aadhaar_number VARCHAR(50) NOT NULL,
      address TEXT NOT NULL,
      customer_type VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
      company_id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT NOT NULL,
      gstin VARCHAR(50) UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id SERIAL PRIMARY KEY,
      category_name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS units (
      unit_id SERIAL PRIMARY KEY,
      unit_name VARCHAR(100) UNIQUE NOT NULL,
      abbreviation VARCHAR(20) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      product_id SERIAL PRIMARY KEY,
      product_code VARCHAR(50) UNIQUE NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      company_id INT NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
      category_id INT NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
      unit_id INT NOT NULL REFERENCES units(unit_id) ON DELETE RESTRICT,
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'Active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stock (
      stock_id SERIAL PRIMARY KEY,
      product_id INT NOT NULL UNIQUE REFERENCES products(product_id) ON DELETE CASCADE,
      quantity INT NOT NULL DEFAULT 0,
      reorder_level INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      movement_id SERIAL PRIMARY KEY,
      product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
      movement_type VARCHAR(50) NOT NULL,
      quantity INT NOT NULL,
      reason TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_prices (
      price_id SERIAL PRIMARY KEY,
      product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
      purchase_price NUMERIC(12,2) NOT NULL,
      selling_price NUMERIC(12,2) NOT NULL,
      effective_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      effective_to TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE
    );
  `);

  // Add reference_id to stock_movements if it doesn't exist
  await pool.query(`
    ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS reference_id INT;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      purchase_id SERIAL PRIMARY KEY,
      company_id INT NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
      purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
      invoice_number VARCHAR(100),
      total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS purchase_items (
      purchase_item_id SERIAL PRIMARY KEY,
      purchase_id INT NOT NULL REFERENCES purchases(purchase_id) ON DELETE CASCADE,
      product_id INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
      quantity INT NOT NULL CHECK (quantity > 0),
      purchase_price NUMERIC(12,2) NOT NULL CHECK (purchase_price >= 0),
      total_amount NUMERIC(14,2) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sales (
      sale_id SERIAL PRIMARY KEY,
      customer_id INT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
      sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
      invoice_number VARCHAR(100),
      total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sale_items (
      sale_item_id SERIAL PRIMARY KEY,
      sale_id INT NOT NULL REFERENCES sales(sale_id) ON DELETE CASCADE,
      product_id INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
      quantity INT NOT NULL CHECK (quantity > 0),
      selling_price NUMERIC(12,2) NOT NULL CHECK (selling_price >= 0),
      total_amount NUMERIC(14,2) NOT NULL
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_customers_search ON customers (customer_name, customer_type);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_company ON products (company_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_stock_product ON stock (product_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_prices_product ON product_prices (product_id);
  `);
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
};
