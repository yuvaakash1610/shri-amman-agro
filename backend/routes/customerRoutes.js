const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, customerController.listCustomers);
router.post('/search', authenticateToken, customerController.searchCustomerSecure);
router.get('/:id', authenticateToken, customerController.getCustomer);
router.post('/', authenticateToken, customerController.createCustomer);
router.put('/:id', authenticateToken, customerController.updateCustomer);
router.delete('/:id', authenticateToken, customerController.deleteCustomer);

module.exports = router;
