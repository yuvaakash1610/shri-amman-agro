const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, priceController.listPrices);
router.post('/', authenticateToken, priceController.createPrice);
router.get('/:productId/history', authenticateToken, priceController.getPriceHistory);
router.get('/:productId', authenticateToken, priceController.getPricesByProduct);
router.put('/:id', authenticateToken, priceController.updatePrice);

module.exports = router;
