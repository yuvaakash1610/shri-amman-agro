const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const saleController = require('../controllers/saleController');

router.get('/', authenticateToken, saleController.listSales);
router.post('/', authenticateToken, saleController.createSale);
router.get('/:id', authenticateToken, saleController.getSale);

module.exports = router;
