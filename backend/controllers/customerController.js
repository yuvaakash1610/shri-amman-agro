const crypto = require('crypto');
const db = require('../config/db');

const CUSTOMER_TYPES = ['Farmer', 'Retailer', 'Wholesaler', 'Dealer', 'Other'];

const generateCustomerId = async () => {
  let customerId;
  let attempts = 0;

  while (attempts < 10) {
    customerId = `CUST-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const existing = await db.query('SELECT 1 FROM customers WHERE customer_id = $1', [customerId]);

    if (existing.rows.length === 0) {
      return customerId;
    }

    attempts += 1;
  }

  throw new Error('Unable to generate a unique customer ID.');
};

const listCustomers = async (req, res) => {
  try {
    const { search = '', type = '' } = req.query;
    const params = [];
    const conditions = [];
    let query = `
      SELECT id, customer_id, customer_name, phone_number, aadhaar_number, address, customer_type, email, created_at, updated_at
      FROM customers
    `;

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(
        LOWER(customer_id) LIKE LOWER($${params.length}) OR
        LOWER(customer_name) LIKE LOWER($${params.length}) OR
        LOWER(phone_number) LIKE LOWER($${params.length}) OR
        LOWER(email) LIKE LOWER($${params.length}) OR
        LOWER(customer_type) LIKE LOWER($${params.length})
      )`);
    }

    if (type) {
      params.push(type);
      conditions.push(`customer_type = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({ message: 'Failed to load customers.' });
  }
};

const getCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number.parseInt(id, 10);
    const result = await db.query(
      `SELECT id, customer_id, customer_name, phone_number, aadhaar_number, address, customer_type, email, created_at, updated_at
       FROM customers
       WHERE id = $1::int`,
      [numericId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Failed to fetch customer.' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { customerName, phoneNumber, aadhaarNumber, address, customerType, email } = req.body;

    if (!customerName || !phoneNumber || !aadhaarNumber || !address || !customerType) {
      return res.status(400).json({ message: 'Please fill in all required customer fields.' });
    }

    if (!CUSTOMER_TYPES.includes(customerType)) {
      return res.status(400).json({ message: 'Invalid customer type.' });
    }

    const customerId = await generateCustomerId();

    const result = await db.query(
      `INSERT INTO customers (customer_id, customer_name, phone_number, aadhaar_number, address, customer_type, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, customer_id, customer_name, phone_number, aadhaar_number, address, customer_type, email, created_at, updated_at`,
      [customerId, customerName.trim(), phoneNumber.trim(), aadhaarNumber.trim(), address.trim(), customerType, email ? email.trim() : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Failed to add customer.' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, phoneNumber, aadhaarNumber, address, customerType, email } = req.body;

    if (!customerName || !phoneNumber || !aadhaarNumber || !address || !customerType) {
      return res.status(400).json({ message: 'Please fill in all required customer fields.' });
    }

    if (!CUSTOMER_TYPES.includes(customerType)) {
      return res.status(400).json({ message: 'Invalid customer type.' });
    }

    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid customer ID.' });
    }

    const result = await db.query(
      `UPDATE customers
       SET customer_name = $1,
           phone_number = $2,
           aadhaar_number = $3,
           address = $4,
           customer_type = $5,
           email = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7::int
       RETURNING id, customer_id, customer_name, phone_number, aadhaar_number, address, customer_type, email, created_at, updated_at`,
      [customerName.trim(), phoneNumber.trim(), aadhaarNumber.trim(), address.trim(), customerType, email ? email.trim() : null, numericId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update customer error:', error);
    return res.status(500).json({ message: 'Failed to update customer.', error: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number.parseInt(id, 10);

    if (Number.isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid customer ID.' });
    }

    const result = await db.query(
      `DELETE FROM customers
       WHERE id = $1::int
       RETURNING id, customer_id`,
      [numericId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    return res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Delete customer error:', error);
    return res.status(500).json({ message: 'Failed to delete customer.', error: error.message });
  }
};

module.exports = {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
