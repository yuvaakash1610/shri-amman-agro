const db = require('../config/db');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// We need a raw pool for transactions
const pool = process.env.DATABASE_URL
  ? new (require('pg').Pool)({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new (require('pg').Pool)({
      user: process.env.DB_USER, host: process.env.DB_HOST,
      database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
    });

const createPurchase = async (req, res) => {
  const { companyId, productId, quantity, purchasePrice, purchaseDate, invoiceNumber, notes } = req.body;

  // Validation
  if (!companyId || !productId || quantity === undefined || purchasePrice === undefined) {
    return res.status(400).json({ message: 'Company, product, quantity, and purchase price are required.' });
  }
  const qty = Number.parseInt(quantity, 10);
  const price = Number.parseFloat(purchasePrice);
  if (Number.isNaN(qty) || qty <= 0) return res.status(400).json({ message: 'Quantity must be a positive integer.' });
  if (Number.isNaN(price) || price < 0) return res.status(400).json({ message: 'Purchase price must be a non-negative number.' });

  const totalAmount = qty * price;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert purchase header
    const purchaseResult = await client.query(
      `INSERT INTO purchases (company_id, purchase_date, invoice_number, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING purchase_id`,
      [companyId, purchaseDate || new Date().toISOString().split('T')[0], invoiceNumber || null, totalAmount, notes || null]
    );
    const purchaseId = purchaseResult.rows[0].purchase_id;

    // Insert purchase item
    await client.query(
      `INSERT INTO purchase_items (purchase_id, product_id, quantity, purchase_price, total_amount)
       VALUES ($1, $2, $3, $4, $5)`,
      [purchaseId, productId, qty, price, totalAmount]
    );

    // Upsert stock
    await client.query(
      `INSERT INTO stock (product_id, quantity, reorder_level, updated_at)
       VALUES ($1, $2, 0, CURRENT_TIMESTAMP)
       ON CONFLICT (product_id) DO UPDATE
         SET quantity = stock.quantity + $2, updated_at = CURRENT_TIMESTAMP`,
      [productId, qty]
    );

    // Record stock movement
    await client.query(
      `INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, reason)
       VALUES ($1, 'PURCHASE', $2, $3, $4)`,
      [productId, qty, purchaseId, invoiceNumber ? `Invoice: ${invoiceNumber}` : 'Purchase']
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Purchase recorded successfully.', purchaseId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create purchase error:', error);
    res.status(500).json({ message: 'Failed to record purchase. Transaction rolled back.' });
  } finally {
    client.release();
  }
};

const listPurchases = async (req, res) => {
  try {
    const { search = '', companyId = '' } = req.query;
    const params = [];
    const conditions = [];
    let query = `
      SELECT p.purchase_id, p.purchase_date, p.invoice_number, p.total_amount, p.notes, p.created_at,
             c.company_name,
             pi.quantity, pi.purchase_price,
             pr.product_name, pr.product_code
      FROM purchases p
      JOIN companies c ON c.company_id = p.company_id
      JOIN purchase_items pi ON pi.purchase_id = p.purchase_id
      JOIN products pr ON pr.product_id = pi.product_id
    `;

    if (companyId) {
      params.push(companyId);
      conditions.push(`p.company_id = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(LOWER(pr.product_name) LIKE LOWER($${params.length}) OR LOWER(p.invoice_number) LIKE LOWER($${params.length}) OR LOWER(c.company_name) LIKE LOWER($${params.length}))`);
    }
    if (conditions.length > 0) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List purchases error:', error);
    res.status(500).json({ message: 'Failed to load purchases.' });
  }
};

const getPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) return res.status(400).json({ message: 'Invalid purchase ID.' });

    const result = await db.query(
      `SELECT p.*, c.company_name,
              json_agg(json_build_object(
                'product_id', pi.product_id, 'product_name', pr.product_name,
                'product_code', pr.product_code, 'quantity', pi.quantity,
                'purchase_price', pi.purchase_price, 'total_amount', pi.total_amount
              )) AS items
       FROM purchases p
       JOIN companies c ON c.company_id = p.company_id
       JOIN purchase_items pi ON pi.purchase_id = p.purchase_id
       JOIN products pr ON pr.product_id = pi.product_id
       WHERE p.purchase_id = $1
       GROUP BY p.purchase_id, c.company_name`,
      [numericId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Purchase not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({ message: 'Failed to load purchase.' });
  }
};

module.exports = { createPurchase, listPurchases, getPurchase };
