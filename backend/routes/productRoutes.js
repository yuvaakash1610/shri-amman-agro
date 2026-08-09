const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/categories', authenticateToken, productController.listCategories);
router.post('/categories', authenticateToken, productController.createCategory);
router.get('/units', authenticateToken, productController.listUnits);
router.post('/units', authenticateToken, productController.createUnit);
router.get('/', authenticateToken, productController.listProducts);
router.get('/:id', authenticateToken, productController.getProduct);
router.post('/', authenticateToken, productController.createProduct);
router.put('/:id', authenticateToken, productController.updateProduct);
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
