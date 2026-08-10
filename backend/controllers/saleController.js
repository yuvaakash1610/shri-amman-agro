const db = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const pool = process.env.DATABASE_URL
  ? new (require('pg').Pool)({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : new (require('pg').Pool)({
      user: process.env.DB_USER, host: process.env.DB_HOST,
      database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
    });

const createSale = async (req, res) => {
  const { customerId, productId, quantity, sellingPrice, saleDate, invoiceNumber, notes } = req.body;

  // Validation
  if (!customerId || !productId || quantity === undefined || sellingPrice === undefined) {
    return res.status(400).json({ message: 'Customer, product, quantity, and selling price are required.' });
  }
  const qty = Number.parseInt(quantity, 10);
  const price = Number.parseFloat(sellingPrice);
  if (Number.isNaN(qty) || qty <= 0) return res.status(400).json({ message: 'Quantity must be a positive integer.' });
  if (Number.isNaN(price) || price < 0) return res.status(400).json({ message: 'Selling price must be a non-negative number.' });

  const totalAmount = qty * price;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check available stock (lock the row for update)
    const stockResult = await client.query(
      'SELECT quantity FROM stock WHERE product_id = $1 FOR UPDATE',
      [productId]
    );
    if (stockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No stock record found for this product. Please add stock first.' });
    }
    const currentStock = Number(stockResult.rows[0].quantity);
    if (currentStock < qty) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: `Insufficient stock. Available: ${currentStock}, Requested: ${qty}.` });
    }

    // Insert sale header
    const saleResult = await client.query(
      `INSERT INTO sales (customer_id, sale_date, invoice_number, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING sale_id`,
      [customerId, saleDate || new Date().toISOString().split('T')[0], invoiceNumber || null, totalAmount, notes || null]
    );
    const saleId = saleResult.rows[0].sale_id;

    // Insert sale item
    await client.query(
      `INSERT INTO sale_items (sale_id, product_id, quantity, selling_price, total_amount)
       VALUES ($1, $2, $3, $4, $5)`,
      [saleId, productId, qty, price, totalAmount]
    );

    // Reduce stock
    await client.query(
      `UPDATE stock SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE product_id = $2`,
      [qty, productId]
    );

    // Record stock movement
    await client.query(
      `INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, reason)
       VALUES ($1, 'SALE', $2, $3, $4)`,
      [productId, qty, saleId, invoiceNumber ? `Invoice: ${invoiceNumber}` : 'Sale']
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Sale recorded successfully.', saleId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Failed to record sale. Transaction rolled back.' });
  } finally {
    client.release();
  }
};

const listSales = async (req, res) => {
  try {
    const { search = '', customerId = '' } = req.query;
    const params = [];
    const conditions = [];
    let query = `
      SELECT s.sale_id, s.sale_date, s.invoice_number, s.total_amount, s.notes, s.created_at,
             cust.customer_name, cust.customer_id AS customer_code,
             si.quantity, si.selling_price,
             pr.product_name, pr.product_code
      FROM sales s
      JOIN customers cust ON cust.id = s.customer_id
      JOIN sale_items si ON si.sale_id = s.sale_id
      JOIN products pr ON pr.product_id = si.product_id
    `;

    if (customerId) {
      params.push(customerId);
      conditions.push(`s.customer_id = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(LOWER(pr.product_name) LIKE LOWER($${params.length}) OR LOWER(s.invoice_number) LIKE LOWER($${params.length}) OR LOWER(cust.customer_name) LIKE LOWER($${params.length}))`);
    }
    if (conditions.length > 0) query += ` WHERE ${conditions.join(' AND ')}`;
    query += ' ORDER BY s.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List sales error:', error);
    res.status(500).json({ message: 'Failed to load sales.' });
  }
};

const getSale = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) return res.status(400).json({ message: 'Invalid sale ID.' });

    const result = await db.query(
      `SELECT s.*, cust.customer_name, cust.customer_id AS customer_code,
              json_agg(json_build_object(
                'product_id', si.product_id, 'product_name', pr.product_name,
                'product_code', pr.product_code, 'quantity', si.quantity,
                'selling_price', si.selling_price, 'total_amount', si.total_amount
              )) AS items
       FROM sales s
       JOIN customers cust ON cust.id = s.customer_id
       JOIN sale_items si ON si.sale_id = s.sale_id
       JOIN products pr ON pr.product_id = si.product_id
       WHERE s.sale_id = $1
       GROUP BY s.sale_id, cust.customer_name, cust.customer_id`,
      [numericId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Sale not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ message: 'Failed to load sale.' });
  }
};

module.exports = { createSale, listSales, getSale };
