const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const purchaseController = require('../controllers/purchaseController');

router.get('/', authenticateToken, purchaseController.listPurchases);
router.post('/', authenticateToken, purchaseController.createPurchase);
router.get('/:id', authenticateToken, purchaseController.getPurchase);

module.exports = router;
