const db = require('../backend/config/db');

async function testPrices() {
  try {
    const products = await db.query('SELECT product_id, product_name, product_code FROM products');
    console.log('Products:', products.rows);

    const prices = await db.query('SELECT * FROM product_prices ORDER BY product_id, effective_from DESC');
    console.log('Product Prices:', prices.rows);

    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testPrices();
