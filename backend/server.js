const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initializeDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const companyRoutes = require('./routes/companyRoutes');
const productRoutes = require('./routes/productRoutes');
const stockRoutes = require('./routes/stockRoutes');
const priceRoutes = require('./routes/priceRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const saleRoutes = require('./routes/saleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const whatsappService = require('./services/whatsappService');
const { authenticateToken } = require('./middlewares/authMiddleware');
const companyController = require('./controllers/companyController');
const productController = require('./controllers/productController');
const stockController = require('./controllers/stockController');
const priceController = require('./controllers/priceController');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const frontendPath = path.resolve(__dirname, '..', 'frontend');

const sendFrontendFile = (res, relativePath = 'index.html') => {
  res.sendFile(path.join(frontendPath, relativePath));
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve frontend static files
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);

app.get('/api/companies', authenticateToken, companyController.listCompanies);
app.get('/api/companies/:id', authenticateToken, companyController.getCompany);
app.post('/api/companies', authenticateToken, companyController.createCompany);
app.put('/api/companies/:id', authenticateToken, companyController.updateCompany);
app.delete('/api/companies/:id', authenticateToken, companyController.deleteCompany);

app.get('/api/products/categories', authenticateToken, productController.listCategories);
app.post('/api/products/categories', authenticateToken, productController.createCategory);
app.get('/api/products/units', authenticateToken, productController.listUnits);
app.post('/api/products/units', authenticateToken, productController.createUnit);
app.get('/api/products', authenticateToken, productController.listProducts);
app.get('/api/products/:id', authenticateToken, productController.getProduct);
app.post('/api/products', authenticateToken, productController.createProduct);
app.put('/api/products/:id', authenticateToken, productController.updateProduct);
app.delete('/api/products/:id', authenticateToken, productController.deleteProduct);

app.get('/api/stock', authenticateToken, stockController.listStock);
app.get('/api/stock/:productId', authenticateToken, stockController.getStockByProduct);
app.post('/api/stock/movement', authenticateToken, stockController.createStockMovement);
app.put('/api/stock/:productId', authenticateToken, stockController.updateStock);
app.get('/api/stock/:productId/movements', authenticateToken, stockController.listStockMovements);

app.get('/api/prices', authenticateToken, priceController.listPrices);
app.get('/api/prices/:productId', authenticateToken, priceController.getPricesByProduct);
app.post('/api/prices', authenticateToken, priceController.createPrice);
app.put('/api/prices/:id', authenticateToken, priceController.updatePrice);
app.get('/api/prices/:productId/history', authenticateToken, priceController.getPriceHistory);

app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.get('/', (req, res) => {
  sendFrontendFile(res, 'index.html');
});

app.get('/register.html', (req, res) => {
  sendFrontendFile(res, 'register.html');
});

app.get('/dashboard.html', (req, res) => {
  sendFrontendFile(res, 'dashboard.html');
});

app.get('/customers.html', (req, res) => {
  sendFrontendFile(res, 'customers.html');
});

app.get('/companies.html', (req, res) => {
  sendFrontendFile(res, 'companies.html');
});

app.get('/products.html', (req, res) => {
  sendFrontendFile(res, 'products.html');
});

app.get('/stock.html', (req, res) => {
  sendFrontendFile(res, 'stock.html');
});

app.get('/prices.html', (req, res) => {
  sendFrontendFile(res, 'prices.html');
});

app.get('/purchasing.html', (req, res) => {
  sendFrontendFile(res, 'purchasing.html');
});

app.get('/selling.html', (req, res) => {
  sendFrontendFile(res, 'selling.html');
});

// Catch-all route to serve the frontend for any non-API request
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found.' });
  }

  if (req.path.includes('.')) {
    return res.status(404).send('Not found');
  }

  sendFrontendFile(res, 'index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      // Initialize WhatsApp Client in the background
      setTimeout(() => {
        try {
          whatsappService.initWhatsApp();
        } catch (e) {
          console.error('Failed to init WhatsApp:', e);
        }
      }, 2000);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
