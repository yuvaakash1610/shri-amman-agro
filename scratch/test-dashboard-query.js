const db = require('../backend/config/db');

async function test() {
  try {
    const stockAvail = await db.query(`
      SELECT pr.product_id, pr.product_name, pr.product_code,
             COALESCE(s.quantity, 0) AS quantity,
             cat.category_name, u.abbreviation AS unit
      FROM products pr
      LEFT JOIN stock s ON s.product_id = pr.product_id
      LEFT JOIN categories cat ON cat.category_id = pr.category_id
      LEFT JOIN units u ON u.unit_id = pr.unit_id
      WHERE pr.status = 'Active'
      ORDER BY s.quantity DESC NULLS LAST, pr.product_name ASC
    `);
    console.log('Stock available count:', stockAvail.rows.length);
    console.log('Stock available sample:', stockAvail.rows);

    const stockSold = await db.query(`
      SELECT pr.product_id, pr.product_name, pr.product_code,
             COALESCE(SUM(si.quantity), 0) AS total_sold,
             COALESCE(SUM(si.total_amount), 0) AS total_revenue,
             cat.category_name, u.abbreviation AS unit
      FROM products pr
      JOIN sale_items si ON si.product_id = pr.product_id
      LEFT JOIN categories cat ON cat.category_id = pr.category_id
      LEFT JOIN units u ON u.unit_id = pr.unit_id
      GROUP BY pr.product_id, pr.product_name, pr.product_code, cat.category_name, u.abbreviation
      HAVING COALESCE(SUM(si.quantity), 0) > 0
      ORDER BY total_sold DESC
    `);
    console.log('Stock sold count:', stockSold.rows.length);
    console.log('Stock sold sample:', stockSold.rows);

    process.exit(0);
  } catch (err) {
    console.error('Error running test query:', err);
    process.exit(1);
  }
}

test();
