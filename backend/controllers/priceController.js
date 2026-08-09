const db = require('../config/db');

const listPrices = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const params = [];
    const conditions = [];
    let query = `
      SELECT p.product_id, p.product_code, p.product_name, c.company_name, pp.price_id, pp.purchase_price, pp.selling_price, pp.effective_from, pp.effective_to, pp.is_active
      FROM products p
      LEFT JOIN companies c ON c.company_id = p.company_id
      LEFT JOIN LATERAL (
        SELECT price_id, purchase_price, selling_price, effective_from, effective_to, is_active
        FROM product_prices
        WHERE product_id = p.product_id
        ORDER BY effective_from DESC, price_id DESC
        LIMIT 1
      ) pp ON true
    `;

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(
        LOWER(p.product_code) LIKE LOWER($${params.length}) OR
        LOWER(p.product_name) LIKE LOWER($${params.length}) OR
        LOWER(c.company_name) LIKE LOWER($${params.length})
      )`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY p.product_name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List prices error:', error);
    res.status(500).json({ message: 'Failed to load prices.' });
  }
};

const getPricesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const numericProductId = Number.parseInt(productId, 10);
    if (Number.isNaN(numericProductId)) return res.status(400).json({ message: 'Invalid product ID.' });

    const result = await db.query(
      `SELECT price_id, product_id, purchase_price, selling_price, effective_from, effective_to, is_active
       FROM product_prices
       WHERE product_id = $1::int
       ORDER BY effective_from DESC, price_id DESC`,
      [numericProductId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get product prices error:', error);
    res.status(500).json({ message: 'Failed to load price history.' });
  }
};

const createPrice = async (req, res) => {
  try {
    const { productId, purchasePrice, sellingPrice } = req.body;
    if (!productId || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ message: 'Product, purchase price, and selling price are required.' });
    }

    const numericProductId = Number.parseInt(productId, 10);
    const purchaseValue = Number.parseFloat(purchasePrice);
    const sellingValue = Number.parseFloat(sellingPrice);

    if (Number.isNaN(numericProductId) || Number.isNaN(purchaseValue) || Number.isNaN(sellingValue)) {
      return res.status(400).json({ message: 'Invalid price values.' });
    }

    if (sellingValue < 0 || purchaseValue < 0) {
      return res.status(400).json({ message: 'Prices cannot be negative.' });
    }

    const productResult = await db.query('SELECT product_id FROM products WHERE product_id = $1::int', [numericProductId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await db.query(
      `UPDATE product_prices
       SET effective_to = CURRENT_TIMESTAMP, is_active = FALSE
       WHERE product_id = $1::int AND is_active = TRUE`,
      [numericProductId]
    );

    const result = await db.query(
      `INSERT INTO product_prices (product_id, purchase_price, selling_price, effective_from, effective_to, is_active)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, NULL, TRUE)
       RETURNING price_id, product_id, purchase_price, selling_price, effective_from, effective_to, is_active`,
      [numericProductId, purchaseValue, sellingValue]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create price error:', error);
    res.status(500).json({ message: 'Failed to add price.' });
  }
};

const updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const numericPriceId = Number.parseInt(id, 10);
    const { purchasePrice, sellingPrice } = req.body;
    if (Number.isNaN(numericPriceId)) return res.status(400).json({ message: 'Invalid price ID.' });

    if (purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ message: 'Prices are required.' });
    }

    const purchaseValue = Number.parseFloat(purchasePrice);
    const sellingValue = Number.parseFloat(sellingPrice);
    if (Number.isNaN(purchaseValue) || Number.isNaN(sellingValue)) return res.status(400).json({ message: 'Invalid price values.' });
    if (sellingValue < 0 || purchaseValue < 0) return res.status(400).json({ message: 'Prices cannot be negative.' });

    const result = await db.query(
      `UPDATE product_prices
       SET purchase_price = $1, selling_price = $2
       WHERE price_id = $3::int
       RETURNING price_id, product_id, purchase_price, selling_price, effective_from, effective_to, is_active`,
      [purchaseValue, sellingValue, numericPriceId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Price record not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ message: 'Failed to update price.' });
  }
};

const getPriceHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const numericProductId = Number.parseInt(productId, 10);
    if (Number.isNaN(numericProductId)) return res.status(400).json({ message: 'Invalid product ID.' });

    const result = await db.query(
      `SELECT price_id, product_id, purchase_price, selling_price, effective_from, effective_to, is_active
       FROM product_prices
       WHERE product_id = $1::int
       ORDER BY effective_from DESC, price_id DESC`,
      [numericProductId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({ message: 'Failed to load price history.' });
  }
};

module.exports = {
  listPrices,
  getPricesByProduct,
  createPrice,
  updatePrice,
  getPriceHistory,
};
