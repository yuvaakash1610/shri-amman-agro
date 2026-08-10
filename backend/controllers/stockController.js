const db = require('../config/db');

const listStock = async (req, res) => {
  try {
    const { search = '', lowStock = '', outOfStock = '', categoryId = '', companyId = '' } = req.query;
    const params = [];
    const conditions = [];
    let query = `
      SELECT s.stock_id, s.product_id, p.product_code, p.product_name,
             u.unit_name, u.abbreviation, s.quantity, s.reorder_level, s.updated_at,
             c.company_name, cat.category_name,
             CASE
               WHEN s.quantity = 0 THEN 'Out of Stock'
               WHEN s.quantity < 5 THEN 'Low Stock'
               ELSE 'In Stock'
             END AS stock_status
      FROM stock s
      JOIN products p ON p.product_id = s.product_id
      LEFT JOIN units u ON u.unit_id = p.unit_id
      LEFT JOIN companies c ON c.company_id = p.company_id
      LEFT JOIN categories cat ON cat.category_id = p.category_id
    `;

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(
        LOWER(p.product_code) LIKE LOWER($${params.length}) OR
        LOWER(p.product_name) LIKE LOWER($${params.length})
      )`);
    }

    if (lowStock === 'true') {
      conditions.push('s.quantity > 0 AND s.quantity < 5');
    }

    if (outOfStock === 'true') {
      conditions.push('s.quantity = 0');
    }

    if (categoryId) {
      params.push(categoryId);
      conditions.push(`p.category_id = $${params.length}`);
    }

    if (companyId) {
      params.push(companyId);
      conditions.push(`p.company_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY p.product_name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List stock error:', error);
    res.status(500).json({ message: 'Failed to load stock.' });
  }
};


const getStockByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const numericId = Number.parseInt(productId, 10);
    if (Number.isNaN(numericId)) return res.status(400).json({ message: 'Invalid product ID.' });

    const result = await db.query(
      `SELECT s.stock_id, s.product_id, p.product_code, p.product_name, u.unit_name, u.abbreviation, s.quantity, s.reorder_level,
              CASE WHEN s.quantity = 0 THEN 'Out of Stock' WHEN s.quantity < 5 THEN 'Low Stock' ELSE 'In Stock' END AS stock_status
       FROM stock s
       JOIN products p ON p.product_id = s.product_id
       LEFT JOIN units u ON u.unit_id = p.unit_id
       WHERE s.product_id = $1::int`,
      [numericId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Stock record not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ message: 'Failed to load stock.' });
  }
};

const createStockMovement = async (req, res) => {
  try {
    const { productId, movementType, quantity, reason } = req.body;
    if (!productId || !movementType || quantity === undefined) {
      return res.status(400).json({ message: 'Product, movement type, and quantity are required.' });
    }

    const numericProductId = Number.parseInt(productId, 10);
    const movementQty = Number.parseInt(quantity, 10);
    if (Number.isNaN(numericProductId) || Number.isNaN(movementQty)) {
      return res.status(400).json({ message: 'Invalid product or quantity.' });
    }

    const allowedTypes = ['PURCHASE', 'SALE', 'RETURN', 'DAMAGE', 'ADJUSTMENT'];
    if (!allowedTypes.includes(movementType)) {
      return res.status(400).json({ message: 'Invalid movement type.' });
    }

    const productResult = await db.query('SELECT product_id FROM products WHERE product_id = $1::int', [numericProductId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const stockResult = await db.query('SELECT quantity FROM stock WHERE product_id = $1::int', [numericProductId]);
    let currentQuantity = 0;
    if (stockResult.rows.length > 0) {
      currentQuantity = Number(stockResult.rows[0].quantity);
    }

    let nextQuantity = currentQuantity;
    if (movementType === 'PURCHASE' || movementType === 'RETURN' || movementType === 'ADJUSTMENT') {
      nextQuantity = currentQuantity + movementQty;
    } else if (movementType === 'SALE' || movementType === 'DAMAGE') {
      nextQuantity = currentQuantity - movementQty;
    }

    if (nextQuantity < 0) {
      return res.status(400).json({ message: 'Stock cannot become negative.' });
    }

    await db.query(
      `INSERT INTO stock_movements (product_id, movement_type, quantity, reason)
       VALUES ($1, $2, $3, $4)`,
      [numericProductId, movementType, movementQty, reason || null]
    );

    if (stockResult.rows.length > 0) {
      await db.query(
        `UPDATE stock SET quantity = $1, reorder_level = COALESCE(reorder_level, 0), updated_at = CURRENT_TIMESTAMP WHERE product_id = $2::int`,
        [nextQuantity, numericProductId]
      );
    } else {
      await db.query(
        `INSERT INTO stock (product_id, quantity, reorder_level, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [numericProductId, nextQuantity, 0]
      );
    }

    res.status(201).json({ message: 'Stock updated successfully.' });
  } catch (error) {
    console.error('Create stock movement error:', error);
    res.status(500).json({ message: 'Failed to update stock.' });
  }
};

const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, reorderLevel } = req.body;
    const numericProductId = Number.parseInt(productId, 10);
    const newQuantity = Number.parseInt(quantity, 10);
    const newReorderLevel = Number.parseInt(reorderLevel, 10);

    if (Number.isNaN(numericProductId) || Number.isNaN(newQuantity) || Number.isNaN(newReorderLevel)) {
      return res.status(400).json({ message: 'Invalid stock values.' });
    }

    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Stock cannot become negative.' });
    }

    const result = await db.query(
      `UPDATE stock
       SET quantity = $1, reorder_level = $2, updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $3::int
       RETURNING stock_id, product_id, quantity, reorder_level`,
      [newQuantity, newReorderLevel, numericProductId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stock record not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Failed to update stock.' });
  }
};

const listStockMovements = async (req, res) => {
  try {
    const { productId } = req.params;
    const numericProductId = Number.parseInt(productId, 10);
    if (Number.isNaN(numericProductId)) return res.status(400).json({ message: 'Invalid product ID.' });

    const result = await db.query(
      `SELECT movement_id, product_id, movement_type, quantity, reason, created_at
       FROM stock_movements
       WHERE product_id = $1::int
       ORDER BY created_at DESC`,
      [numericProductId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('List stock movements error:', error);
    res.status(500).json({ message: 'Failed to load movements.' });
  }
};

module.exports = {
  listStock,
  getStockByProduct,
  createStockMovement,
  updateStock,
  listStockMovements,
};
