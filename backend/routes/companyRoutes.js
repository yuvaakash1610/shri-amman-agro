const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, companyController.listCompanies);
router.get('/:id', authenticateToken, companyController.getCompany);
router.post('/', authenticateToken, companyController.createCompany);
router.put('/:id', authenticateToken, companyController.updateCompany);
router.delete('/:id', authenticateToken, companyController.deleteCompany);

module.exports = router;
