const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, stockController.listStock);
router.get('/:productId', authenticateToken, stockController.getStockByProduct);
router.post('/movement', authenticateToken, stockController.createStockMovement);
router.put('/:productId', authenticateToken, stockController.updateStock);
router.get('/:productId/movements', authenticateToken, stockController.listStockMovements);

module.exports = router;
