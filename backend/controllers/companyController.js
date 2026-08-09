const db = require('../config/db');

const listCompanies = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const params = [];
    const conditions = [];
    let query = `
      SELECT company_id, company_name, contact_person, phone, email, address, gstin, created_at, updated_at
      FROM companies
    `;

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(
        LOWER(company_name) LIKE LOWER($${params.length}) OR
        LOWER(contact_person) LIKE LOWER($${params.length}) OR
        LOWER(phone) LIKE LOWER($${params.length}) OR
        LOWER(email) LIKE LOWER($${params.length}) OR
        LOWER(gstin) LIKE LOWER($${params.length})
      )`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY company_name ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List companies error:', error);
    res.status(500).json({ message: 'Failed to load companies.' });
  }
};

const getCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number.parseInt(id, 10);

    if (Number.isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid company ID.' });
    }

    const result = await db.query(
      `SELECT company_id, company_name, contact_person, phone, email, address, gstin, created_at, updated_at
       FROM companies
       WHERE company_id = $1::int`,
      [numericId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Failed to fetch company.' });
  }
};

const createCompany = async (req, res) => {
  try {
    const { companyName, contactPerson, phone, email, address, gstin } = req.body;

    if (!companyName || !address) {
      return res.status(400).json({ message: 'Company name and address are required.' });
    }

    const result = await db.query(
      `INSERT INTO companies (company_name, contact_person, phone, email, address, gstin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING company_id, company_name, contact_person, phone, email, address, gstin, created_at, updated_at`,
      [companyName.trim(), contactPerson ? contactPerson.trim() : null, phone ? phone.trim() : null, email ? email.trim() : null, address.trim(), gstin ? gstin.trim() : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Failed to add company.' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, contactPerson, phone, email, address, gstin } = req.body;
    const numericId = Number.parseInt(id, 10);

    if (Number.isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid company ID.' });
    }

    if (!companyName || !address) {
      return res.status(400).json({ message: 'Company name and address are required.' });
    }

    const result = await db.query(
      `UPDATE companies
       SET company_name = $1,
           contact_person = $2,
           phone = $3,
           email = $4,
           address = $5,
           gstin = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE company_id = $7::int
       RETURNING company_id, company_name, contact_person, phone, email, address, gstin, created_at, updated_at`,
      [companyName.trim(), contactPerson ? contactPerson.trim() : null, phone ? phone.trim() : null, email ? email.trim() : null, address.trim(), gstin ? gstin.trim() : null, numericId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Failed to update company.' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number.parseInt(id, 10);

    if (Number.isNaN(numericId)) {
      return res.status(400).json({ message: 'Invalid company ID.' });
    }

    const result = await db.query(
      `DELETE FROM companies
       WHERE company_id = $1::int
       RETURNING company_id`,
      [numericId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    res.json({ message: 'Company deleted successfully.' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Failed to delete company.' });
  }
};

module.exports = {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
};
