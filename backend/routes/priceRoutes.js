const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, priceController.listPrices);
router.get('/:productId', authenticateToken, priceController.getPricesByProduct);
router.post('/', authenticateToken, priceController.createPrice);
router.put('/:id', authenticateToken, priceController.updatePrice);
router.get('/:productId/history', authenticateToken, priceController.getPriceHistory);

module.exports = router;
