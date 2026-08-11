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
  // Supports multi-item cart: body = { customerId, saleDate, invoiceNumber, notes, items: [{productId, quantity, sellingPrice, gstRate}] }
  const { customerId, saleDate, invoiceNumber, notes, items } = req.body;

  if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Customer and at least one item are required.' });
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId) return res.status(400).json({ message: `Item ${i + 1}: productId is required.` });
    const qty = Number.parseInt(item.quantity, 10);
    const price = Number.parseFloat(item.sellingPrice);
    if (Number.isNaN(qty) || qty <= 0) return res.status(400).json({ message: `Item ${i + 1}: Quantity must be a positive integer.` });
    if (Number.isNaN(price) || price < 0) return res.status(400).json({ message: `Item ${i + 1}: Selling price must be non-negative.` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check & lock stock for all items
    for (const item of items) {
      const stockResult = await client.query(
        'SELECT quantity FROM stock WHERE product_id = $1 FOR UPDATE',
        [item.productId]
      );
      if (stockResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `No stock record found for product ID ${item.productId}. Add stock first.` });
      }
      const currentStock = Number(stockResult.rows[0].quantity);
      const qty = Number.parseInt(item.quantity, 10);
      if (currentStock < qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: `Insufficient stock for product ID ${item.productId}. Available: ${currentStock}, Requested: ${qty}.` });
      }
    }

    // Generate invoice number if not provided
    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber) {
      const invRes = await client.query(`SELECT invoice_number FROM sales WHERE invoice_number LIKE 'SAAT%' ORDER BY sale_id DESC LIMIT 1`);
      let nextNum = 1;
      if (invRes.rows.length > 0 && invRes.rows[0].invoice_number) {
        const match = invRes.rows[0].invoice_number.match(/SAAT(\d{4})/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
      }
      finalInvoiceNumber = `SAAT${String(nextNum).padStart(4, '0')}`;
    }

    // Calculate grand total (sum of all items including GST)
    let grandTotal = 0;
    const processedItems = items.map(item => {
      const qty = Number.parseInt(item.quantity, 10);
      const price = Number.parseFloat(item.sellingPrice);
      const gstRate = Number.parseFloat(item.gstRate) || 0;
      const subTotal = qty * price;
      const halfGstRate = gstRate / 2;
      const cgstAmount = parseFloat(((subTotal * halfGstRate) / 100).toFixed(2));
      const sgstAmount = parseFloat(((subTotal * halfGstRate) / 100).toFixed(2));
      const lineTotal = subTotal + cgstAmount + sgstAmount;
      grandTotal += lineTotal;
      return { productId: item.productId, qty, price, gstRate, subTotal, cgstAmount, sgstAmount, lineTotal };
    });

    // Insert sale header
    const saleResult = await client.query(
      `INSERT INTO sales (customer_id, sale_date, invoice_number, total_amount, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING sale_id`,
      [customerId, saleDate || new Date().toISOString().split('T')[0], finalInvoiceNumber, grandTotal.toFixed(2), notes || null]
    );
    const saleId = saleResult.rows[0].sale_id;

    // Insert all sale items, deduct stock, record movements
    for (const item of processedItems) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, selling_price, total_amount, gst_rate, cgst_amount, sgst_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [saleId, item.productId, item.qty, item.price, item.lineTotal.toFixed(2), item.gstRate, item.cgstAmount, item.sgstAmount]
      );

      await client.query(
        `UPDATE stock SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE product_id = $2`,
        [item.qty, item.productId]
      );

      await client.query(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, reference_id, reason)
         VALUES ($1, 'SALE', $2, $3, $4)`,
        [item.productId, item.qty, saleId, finalInvoiceNumber ? `Invoice: ${finalInvoiceNumber}` : 'Sale']
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Sale recorded successfully.', saleId, invoiceNumber: finalInvoiceNumber });
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

    // Aggregate sale_items per sale so multi-item sales appear as one row
    let query = `
      SELECT s.sale_id, s.sale_date, s.invoice_number, s.total_amount, s.notes, s.created_at,
             cust.customer_name, cust.id AS customer_db_id, cust.phone_number,
             json_agg(json_build_object(
               'product_id', si.product_id, 'product_name', pr.product_name,
               'product_code', pr.product_code, 'quantity', si.quantity,
               'selling_price', si.selling_price, 'total_amount', si.total_amount,
               'gst_rate', si.gst_rate, 'cgst_amount', si.cgst_amount, 'sgst_amount', si.sgst_amount,
               'hsn_code', pr.hsn_code
             ) ORDER BY si.sale_item_id) AS items
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
    query += ' GROUP BY s.sale_id, cust.customer_name, cust.id, cust.phone_number ORDER BY s.created_at DESC';

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
      `SELECT s.*, cust.customer_name, cust.phone_number,
              json_agg(json_build_object(
                'product_id', si.product_id, 'product_name', pr.product_name,
                'product_code', pr.product_code, 'quantity', si.quantity,
                'selling_price', si.selling_price, 'total_amount', si.total_amount,
                'gst_rate', si.gst_rate, 'cgst_amount', si.cgst_amount, 'sgst_amount', si.sgst_amount,
                'hsn_code', pr.hsn_code
              ) ORDER BY si.sale_item_id) AS items
       FROM sales s
       JOIN customers cust ON cust.id = s.customer_id
       JOIN sale_items si ON si.sale_id = s.sale_id
       JOIN products pr ON pr.product_id = si.product_id
       WHERE s.sale_id = $1
       GROUP BY s.sale_id, cust.customer_name, cust.phone_number`,
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
