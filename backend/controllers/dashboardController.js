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
    res.json(result.rows);
  } catch (error) {
    console.error('Stock by product error:', error);
    res.status(500).json({ message: 'Failed to load stock by product.' });
  }
};

const getStockSoldDetails = async (req, res) => {
  try {
    const result = await db.query(`
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
    res.json(result.rows);
  } catch (error) {
    console.error('Stock sold details error:', error);
    res.status(500).json({ message: 'Failed to load stock sold details.' });
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

const getProfitAnalytics = async (req, res) => {
  try {
    const unitCostExpr = `COALESCE(
      pp.purchase_price,
      (SELECT pi.purchase_price FROM purchase_items pi WHERE pi.product_id = si.product_id ORDER BY pi.purchase_item_id DESC LIMIT 1),
      0
    )`;

    const productUnitCostExpr = `COALESCE(
      pp.purchase_price,
      (SELECT pi.purchase_price FROM purchase_items pi WHERE pi.product_id = pr.product_id ORDER BY pi.purchase_item_id DESC LIMIT 1),
      0
    )`;

    const [todayResult, monthResult, totalResult, productProfitResult] = await Promise.all([
      // Today Profit
      db.query(`
        SELECT 
          COALESCE(SUM(si.total_amount), 0) AS revenue,
          COALESCE(SUM(si.quantity * ${unitCostExpr}), 0) AS cost,
          COALESCE(SUM(si.total_amount - (si.quantity * ${unitCostExpr})), 0) AS profit
        FROM sales s
        JOIN sale_items si ON si.sale_id = s.sale_id
        LEFT JOIN product_prices pp ON pp.product_id = si.product_id AND pp.is_active = true
        WHERE s.sale_date = CURRENT_DATE
      `),
      // Current Month Profit
      db.query(`
        SELECT 
          COALESCE(SUM(si.total_amount), 0) AS revenue,
          COALESCE(SUM(si.quantity * ${unitCostExpr}), 0) AS cost,
          COALESCE(SUM(si.total_amount - (si.quantity * ${unitCostExpr})), 0) AS profit
        FROM sales s
        JOIN sale_items si ON si.sale_id = s.sale_id
        LEFT JOIN product_prices pp ON pp.product_id = si.product_id AND pp.is_active = true
        WHERE DATE_TRUNC('month', s.sale_date) = DATE_TRUNC('month', CURRENT_DATE)
      `),
      // Overall Total Profit
      db.query(`
        SELECT 
          COALESCE(SUM(si.total_amount), 0) AS revenue,
          COALESCE(SUM(si.quantity * ${unitCostExpr}), 0) AS cost,
          COALESCE(SUM(si.total_amount - (si.quantity * ${unitCostExpr})), 0) AS profit
        FROM sales s
        JOIN sale_items si ON si.sale_id = s.sale_id
        LEFT JOIN product_prices pp ON pp.product_id = si.product_id AND pp.is_active = true
      `),
      // Profitability per product
      db.query(`
        SELECT 
          pr.product_id, pr.product_name, pr.product_code, cat.category_name,
          COALESCE(SUM(si.quantity), 0) AS total_sold,
          COALESCE(SUM(si.total_amount), 0) AS total_revenue,
          COALESCE(SUM(si.quantity * ${productUnitCostExpr}), 0) AS total_cost,
          COALESCE(SUM(si.total_amount - (si.quantity * ${productUnitCostExpr})), 0) AS total_profit
        FROM products pr
        LEFT JOIN sale_items si ON si.product_id = pr.product_id
        LEFT JOIN categories cat ON cat.category_id = pr.category_id
        LEFT JOIN product_prices pp ON pp.product_id = pr.product_id AND pp.is_active = true
        GROUP BY pr.product_id, pr.product_name, pr.product_code, cat.category_name, pp.purchase_price
        HAVING COALESCE(SUM(si.quantity), 0) > 0
        ORDER BY total_profit DESC
      `)
    ]);

    const formatMetrics = (row) => {
      const revenue = Number(row.revenue);
      const cost = Number(row.cost);
      const profit = Number(row.profit);
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0.0';
      return { revenue, cost, profit, margin: Number(margin) };
    };

    res.json({
      today: formatMetrics(todayResult.rows[0]),
      month: formatMetrics(monthResult.rows[0]),
      total: formatMetrics(totalResult.rows[0]),
      products: productProfitResult.rows.map(p => {
        const rev = Number(p.total_revenue);
        const prof = Number(p.total_profit);
        const margin = rev > 0 ? ((prof / rev) * 100).toFixed(1) : '0.0';
        return {
          ...p,
          total_sold: Number(p.total_sold),
          total_revenue: rev,
          total_cost: Number(p.total_cost),
          total_profit: prof,
          margin: Number(margin)
        };
      })
    });
  } catch (error) {
    console.error('Profit analytics error:', error);
    res.status(500).json({ message: 'Failed to load profit analytics.' });
  }
};

module.exports = {
  getDashboardStats,
  getTopSellingProducts,
  getLowStockProducts,
  getStockByProduct,
  getStockSoldDetails,
  getSalesTrend,
  getPurchaseVsSales,
  getProfitAnalytics,
};

