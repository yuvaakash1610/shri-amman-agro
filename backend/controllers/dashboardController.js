const db = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProductsResult,
      stockAvailableResult,
      stockSoldResult,
      lowStockResult,
      nearlyOutResult,
      purchaseValueResult,
      salesValueResult,
    ] = await Promise.all([
      // Total distinct active products
      db.query(`SELECT COUNT(*) AS total FROM products WHERE status = 'Active'`),
      // Total units currently in stock
      db.query(`SELECT COALESCE(SUM(quantity), 0) AS total FROM stock`),
      // Total units sold
      db.query(`SELECT COALESCE(SUM(quantity), 0) AS total FROM sale_items`),
      // Products with low stock (quantity < 5 and > 0)
      db.query(`SELECT COUNT(*) AS total FROM stock WHERE quantity > 0 AND quantity < 5`),
      // Products nearly out of stock (quantity = 0)
      db.query(`SELECT COUNT(*) AS total FROM stock WHERE quantity = 0`),
      // Total purchase value
      db.query(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM purchases`),
      // Total sales value
      db.query(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM sales`),
    ]);

    res.json({
      totalProducts: Number(totalProductsResult.rows[0].total),
      totalStockAvailable: Number(stockAvailableResult.rows[0].total),
      totalStockSold: Number(stockSoldResult.rows[0].total),
      productsLowStock: Number(lowStockResult.rows[0].total),
      productsOutOfStock: Number(nearlyOutResult.rows[0].total),
      totalPurchaseValue: Number(purchaseValueResult.rows[0].total),
      totalSalesValue: Number(salesValueResult.rows[0].total),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to load dashboard stats.' });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pr.product_id, pr.product_name, pr.product_code,
             COALESCE(SUM(si.quantity), 0) AS total_sold,
             COALESCE(SUM(si.total_amount), 0) AS total_revenue,
             cat.category_name
      FROM products pr
      LEFT JOIN sale_items si ON si.product_id = pr.product_id
      LEFT JOIN categories cat ON cat.category_id = pr.category_id
      GROUP BY pr.product_id, pr.product_name, pr.product_code, cat.category_name
      ORDER BY total_sold DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Top selling products error:', error);
    res.status(500).json({ message: 'Failed to load top selling products.' });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pr.product_name, pr.product_code, s.quantity AS current_stock,
             s.reorder_level, s.updated_at,
             CASE
               WHEN s.quantity = 0 THEN 'Out of Stock'
               WHEN s.quantity < 5 THEN 'Low Stock'
               ELSE 'In Stock'
             END AS stock_status
      FROM stock s
      JOIN products pr ON pr.product_id = s.product_id
      WHERE s.quantity < 5
      ORDER BY s.quantity ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Low stock products error:', error);
    res.status(500).json({ message: 'Failed to load low stock products.' });
  }
};

const getStockByProduct = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT pr.product_name, pr.product_code, s.quantity,
             cat.category_name
      FROM stock s
      JOIN products pr ON pr.product_id = s.product_id
      LEFT JOIN categories cat ON cat.category_id = pr.category_id
      ORDER BY s.quantity DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Stock by product error:', error);
    res.status(500).json({ message: 'Failed to load stock by product.' });
  }
};

const getSalesTrend = async (req, res) => {
  try {
    // Last 30 days daily sales
    const result = await db.query(`
      SELECT DATE(s.sale_date) AS sale_day,
             COALESCE(SUM(si.total_amount), 0) AS daily_revenue,
             COALESCE(SUM(si.quantity), 0) AS daily_units
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.sale_id
      WHERE s.sale_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(s.sale_date)
      ORDER BY sale_day ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Sales trend error:', error);
    res.status(500).json({ message: 'Failed to load sales trend.' });
  }
};

const getPurchaseVsSales = async (req, res) => {
  try {
    // Monthly purchase totals (last 6 months)
    const purchaseResult = await db.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', purchase_date), 'Mon YYYY') AS month,
             DATE_TRUNC('month', purchase_date) AS month_date,
             COALESCE(SUM(total_amount), 0) AS total
      FROM purchases
      WHERE purchase_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', purchase_date)
      ORDER BY month_date ASC
    `);

    // Monthly sales totals (last 6 months)
    const salesResult = await db.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', sale_date), 'Mon YYYY') AS month,
             DATE_TRUNC('month', sale_date) AS month_date,
             COALESCE(SUM(total_amount), 0) AS total
      FROM sales
      WHERE sale_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', sale_date)
      ORDER BY month_date ASC
    `);

    // Merge by month
    const monthsSet = new Set();
    purchaseResult.rows.forEach(r => monthsSet.add(r.month));
    salesResult.rows.forEach(r => monthsSet.add(r.month));

    const purchaseMap = {};
    purchaseResult.rows.forEach(r => { purchaseMap[r.month] = Number(r.total); });
    const salesMap = {};
    salesResult.rows.forEach(r => { salesMap[r.month] = Number(r.total); });

    const months = Array.from(monthsSet).sort();
    res.json({
      months,
      purchases: months.map(m => purchaseMap[m] || 0),
      sales: months.map(m => salesMap[m] || 0),
    });
  } catch (error) {
    console.error('Purchase vs sales error:', error);
    res.status(500).json({ message: 'Failed to load purchase vs sales data.' });
  }
};

module.exports = {
  getDashboardStats,
  getTopSellingProducts,
  getLowStockProducts,
  getStockByProduct,
  getSalesTrend,
  getPurchaseVsSales,
};
