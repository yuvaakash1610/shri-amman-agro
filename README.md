# Shri Amman Agro Traders 🌾
**A Complete Inventory & Sales Management System**
This is a full-stack, responsive web application designed specifically for agro-traders to seamlessly manage day-to-day business operations. It tracks inventory, processes sales and purchases, manages customer/company databases, and provides real-time analytics on stock and revenue.
---
## 🚀 Features
### 1. 📊 Interactive Dashboard
- **Live Metrics:** View total products, available stock, total items sold, total purchase value, and total sales revenue.
- **Visual Analytics:** Beautifully integrated charts (using Chart.js) showing Daily Sales Trends and Monthly Purchases vs. Sales.
- **Stock Alerts:** Immediate visibility into "Low Stock" and "Out of Stock" products.
- **Top Sellers:** Automatically calculates and displays the highest-selling products.
### 2. 👥 Customer & Company Management
- **Customer Database:** Store customer details (Farmers, Retailers, Wholesalers). 
- **Secure Searching:** Search customers by Phone Number, Customer ID, Name, or Aadhaar. Aadhaar numbers are securely masked in the UI.
- **Company Management:** Track partner companies and suppliers.
### 3. 📦 Product & Stock Management
- **Product Catalog:** Manage product codes, names, categories, and associate them with companies.
- **Real-Time Stock Tracking:** View accurate stock levels. The system dynamically tags stock as `IN STOCK`, `LOW STOCK` (< 5 units), or `OUT OF STOCK` (0 units).
- **Price Management:** Easily update the Buying Price and Selling Price for any product.
### 4. 🛒 Purchasing & Selling (Transactions)
- **Purchasing:** Record incoming inventory from suppliers. Automatically **increases** the stock levels of the purchased products.
- **Selling:** Fast, optimized checkout process. Automatically **decreases** stock levels. Includes real-time stock verification to prevent overselling.
### 5. 🔒 Security & UX
- **Authentication:** Secure login portal with JWT (JSON Web Tokens) and password hashing (bcrypt).
- **Responsive UI:** A clean, modern, and earthy-green aesthetic that works flawlessly on desktops and tablets.
- **Unified Navigation:** Consistent, horizontally scrolling navigation bar across all modules.
---
## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3 (Custom Design System), Vanilla JavaScript (ES6+), Chart.js
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (using `pg` Node module)
- **Security:** `jsonwebtoken`, `bcrypt`, `cors`
---
## ⚙️ Installation & Setup
### Prerequisites
1. **Node.js** (v14 or higher)
2. **PostgreSQL** (v12 or higher)
### 1. Clone & Install Dependencies
Navigate to the project folder and install the required Node.js packages:
```bash
npm install
```
### 2. Database Setup
1. Open PostgreSQL (pgAdmin or psql command line).
2. Create a new database (e.g., `shri_amman_agro`).
3. Execute the SQL schema (located in your database setup file or generated via backend scripts) to create the following tables:
   - `users`
   - `customers`
   - `companies`
   - `products`
   - `stock`
   - `prices`
   - `purchases` & `purchase_items`
   - `sales` & `sale_items`
### 3. Environment Variables
Create a `.env` file in the root directory (or use the existing one) and configure the following:
```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shri_amman_agro
JWT_SECRET=your_super_secret_jwt_key
```
### 4. Start the Application
Run the backend server:
```bash
npm start
```
*The server will start on `http://localhost:3000` (or the port defined in your `.env`).*
Open `frontend/index.html` in your browser (or access it via your local server if statically served) to access the Login page.
---
## 📂 Project Structure
```text
shri-amman-agro/
│
├── backend/
│   ├── controllers/      # Business logic (sales, products, dashboard, etc.)
│   ├── middleware/       # JWT Authentication middleware
│   ├── routes/           # Express API route definitions
│   ├── db.js             # PostgreSQL connection pool setup
│   └── server.js         # Entry point for the Express server
│
├── frontend/
│   ├── css/
│   │   └── style.css     # Global UI styling and variables
│   ├── js/               # Frontend logic for each respective HTML page
│   ├── index.html        # Login Page
│   ├── dashboard.html    # Main Analytics Dashboard
│   ├── selling.html      # Point of Sale UI
│   ├── purchasing.html   # Purchase Entry UI
│   └── ...               # (customers, stock, products, companies, prices)
│
├── package.json          # Node dependencies and scripts
└── .env                  # Environment configuration
```
---
## 🛡️ API Endpoints (Brief Overview)
- **Auth:** `POST /api/auth/login`
- **Dashboard:** `GET /api/dashboard/stats`, `GET /api/dashboard/sales-trend`, `GET /api/dashboard/purchase-vs-sales`
- **Products:** `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`
- **Stock:** `GET /api/stock`, `GET /api/stock/:productId`
- **Sales:** `POST /api/sales`, `GET /api/sales`
- **Purchases:** `POST /api/purchases`, `GET /api/purchases`
- **Customers:** `GET /api/customers`, `POST /api/customers/search`
---
## 💡 Usage Workflow
1. **Login:** Use administrator credentials to log in.
2. **Setup Base Data:** Add Companies, then add Products.
3. **Manage Prices:** Set the Buying and Selling prices in the Price Management tab.
4. **Initial Stock:** Record incoming inventory via the **Purchasing** tab to establish stock.
5. **Start Selling:** Use the **Selling** tab to check out customers, automatically updating stock levels and dashboard revenue.
---
*Designed & Developed for Shri Amman Agro Traders.*
# shri-amman-agro
Shri
