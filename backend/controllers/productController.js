const crypto = require('crypto');
const db = require('../config/db');

const generateProductCode = async () => {
  let code;
  let attempts = 0;

  while (attempts < 10) {
    code = `PRD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const existing = await db.query('SELECT 1 FROM products WHERE product_code = $1', [code]);

    if (existing.rows.length === 0) {
      return code;
    }

    attempts += 1;
  }

  throw new Error('Unable to generate a unique product code.');
};

const listCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT category_id, category_name, description FROM categories ORDER BY category_name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ message: 'Failed to load categories.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;
    if (!categoryName) return res.status(400).json({ message: 'Category name is required.' });
    const result = await db.query(
      `INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING category_id, category_name, description`,
      [categoryName.trim(), description ? description.trim() : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to add category.' });
  }
};

const listUnits = async (req, res) => {
  try {
    const result = await db.query('SELECT unit_id, unit_name, abbreviation FROM units ORDER BY unit_name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('List units error:', error);
    res.status(500).json({ message: 'Failed to load units.' });
  }
};

const createUnit = async (req, res) => {
  try {
    const { unitName, abbreviation } = req.body;
    if (!unitName) return res.status(400).json({ message: 'Unit name is required.' });
    const result = await db.query(
      `INSERT INTO units (unit_name, abbreviation) VALUES ($1, $2) RETURNING unit_id, unit_name, abbreviation`,
      [unitName.trim(), abbreviation ? abbreviation.trim() : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create unit error:', error);
    res.status(500).json({ message: 'Failed to add unit.' });
  }
};

const listProducts = async (req, res) => {
  try {
    const { search = '', companyId = '', categoryId = '' } = req.query;
    const params = [];
    const conditions = [];
    let query = `
      SELECT p.product_id, p.product_code, p.product_name, p.company_id, c.company_name, p.category_id, cat.category_name, p.unit_id, u.unit_name, u.abbreviation,
             p.description, p.status, p.created_at
      FROM products p
      LEFT JOIN companies c ON c.company_id = p.company_id
      LEFT JOIN categories cat ON cat.category_id = p.category_id
      LEFT JOIN units u ON u.unit_id = p.unit_id
    `;

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(
        LOWER(p.product_code) LIKE LOWER($${params.length}) OR
        LOWER(p.product_name) LIKE LOWER($${params.length}) OR
        LOWER(c.company_name) LIKE LOWER($${params.length}) OR
        LOWER(cat.category_name) LIKE LOWER($${params.length})
      )`);
    }

    if (companyId) {
      params.push(companyId);
      conditions.push(`p.company_id = $${params.length}`);
    }

    if (categoryId) {
      params.push(categoryId);
      conditions.push(`p.category_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ message: 'Failed to load products.' });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) return res.status(400).json({ message: 'Invalid product ID.' });

    const result = await db.query(
      `SELECT p.product_id, p.product_code, p.product_name, p.company_id, c.company_name, p.category_id, cat.category_name, p.unit_id, u.unit_name, u.abbreviation,
              p.description, p.status, p.created_at
       FROM products p
       LEFT JOIN companies c ON c.company_id = p.company_id
       LEFT JOIN categories cat ON cat.category_id = p.category_id
       LEFT JOIN units u ON u.unit_id = p.unit_id
       WHERE p.product_id = $1::int`,
      [numericId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product.' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { productName, companyId, categoryId, unitId, description, status } = req.body;
    if (!productName || !companyId || !categoryId || !unitId) {
      return res.status(400).json({ message: 'Product name, company, category, and unit are required.' });
    }

    const productCode = await generateProductCode();

    const result = await db.query(
      `INSERT INTO products (product_code, product_name, company_id, category_id, unit_id, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING product_id, product_code, product_name, company_id, category_id, unit_id, description, status, created_at`,
      [productCode, productName.trim(), companyId, categoryId, unitId, description ? description.trim() : null, status || 'Active']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to add product.' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number.parseInt(id, 10);
    const { productName, companyId, categoryId, unitId, description, status } = req.body;

    if (Number.isNaN(numericId)) return res.status(400).json({ message: 'Invalid product ID.' });
    if (!productName || !companyId || !categoryId || !unitId) {
      return res.status(400).json({ message: 'Product name, company, category, and unit are required.' });
    }

    const result = await db.query(
      `UPDATE products
       SET product_name = $1,
           company_id = $2,
           category_id = $3,
           unit_id = $4,
           description = $5,
           status = $6
       WHERE product_id = $7::int
       RETURNING product_id, product_code, product_name, company_id, category_id, unit_id, description, status, created_at`,
      [productName.trim(), companyId, categoryId, unitId, description ? description.trim() : null, status || 'Active', numericId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number.parseInt(id, 10);
    if (Number.isNaN(numericId)) return res.status(400).json({ message: 'Invalid product ID.' });

    const result = await db.query(
      `DELETE FROM products WHERE product_id = $1::int RETURNING product_id`,
      [numericId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product.' });
  }
};

module.exports = {
  listCategories,
  createCategory,
  listUnits,
  createUnit,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
