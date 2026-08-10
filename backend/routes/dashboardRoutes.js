const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', authenticateToken, dashboardController.getDashboardStats);
router.get('/top-selling', authenticateToken, dashboardController.getTopSellingProducts);
router.get('/low-stock', authenticateToken, dashboardController.getLowStockProducts);
router.get('/stock-by-product', authenticateToken, dashboardController.getStockByProduct);
router.get('/sales-trend', authenticateToken, dashboardController.getSalesTrend);
router.get('/purchase-vs-sales', authenticateToken, dashboardController.getPurchaseVsSales);

module.exports = router;
