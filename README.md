# 🌾 Shri Amman Agro Traders — Business Management System

A full-stack web application for managing day-to-day business operations of **Shri Amman Agro Traders**, including inventory, sales, purchases, customers, pricing, and WhatsApp invoice delivery.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [WhatsApp Integration](#whatsapp-integration)
- [Known Issues & Fixes](#known-issues--fixes)

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **Auth** | Secure login & registration with JWT authentication and bcrypt password hashing |
| 📊 **Dashboard** | Real-time KPIs — total sales, purchases, customers, revenue, and low-stock alerts |
| 👥 **Customers** | Add, edit, search, and manage customers with Aadhaar, phone, address, and type |
| 🏢 **Companies** | Manage supplier/vendor companies with GSTIN, contact, and address details |
| 📦 **Products** | Full product catalogue with categories, units, HSN codes, and GST rates |
| 🗄️ **Stock** | Track stock quantities, reorder levels, and full movement history |
| 💰 **Prices** | Manage product purchase and selling prices with historical price tracking |
| 🛒 **Purchasing** | Record purchases from suppliers with line items and automatic stock updates |
| 🧾 **Selling** | Create sales invoices with GST (CGST + SGST) calculation, PDF generation |
| 📱 **WhatsApp** | Send PDF invoices directly to customers via WhatsApp (QR-code based auth) |

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js v24+
- **Framework**: Express.js v5
- **Database**: PostgreSQL (via `pg` driver)
- **Auth**: JSON Web Tokens (`jsonwebtoken`) + `bcrypt`
- **WhatsApp**: `whatsapp-web.js` with Puppeteer + `qrcode`
- **Environment**: `dotenv` / `dotenvx`

### Frontend
- Vanilla **HTML5**, **CSS3**, **JavaScript**
- No frameworks — lightweight and fast
- Pages: Login, Register, Dashboard, Customers, Companies, Products, Stock, Prices, Purchasing, Selling

---

## 📁 Project Structure

```
shri-amman-agro/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL pool & DB schema initialization
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── companyController.js
│   │   ├── productController.js
│   │   ├── stockController.js
│   │   ├── priceController.js
│   │   ├── purchaseController.js
│   │   ├── saleController.js
│   │   ├── dashboardController.js
│   │   └── whatsappController.js
│   ├── middlewares/
│   │   └── authMiddleware.js     # JWT authentication middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── productRoutes.js
│   │   ├── stockRoutes.js
│   │   ├── productRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── whatsappRoutes.js
│   ├── services/
│   │   └── whatsappService.js    # WhatsApp client lifecycle & PDF delivery
│   ├── seed.js                   # Optional DB seed script
│   └── server.js                 # Entry point — Express app & route wiring
├── frontend/
│   ├── css/                      # Stylesheets
│   ├── js/                       # Page-specific JavaScript modules
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── dashboard.js
│   │   ├── customers.js
│   │   ├── companies.js
│   │   ├── products.js
│   │   ├── stock.js
│   │   ├── prices.js
│   │   ├── purchasing.js
│   │   └── selling.js
│   ├── images/
│   ├── index.html                # Login page
│   ├── register.html
│   ├── dashboard.html
│   ├── customers.html
│   ├── companies.html
│   ├── products.html
│   ├── stock.html
│   ├── prices.html
│   ├── purchasing.html
│   └── selling.html
├── .env                          # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## 🗃 Database Schema

The database is auto-initialized on server start via `initializeDatabase()`. Tables created:

| Table | Description |
|---|---|
| `users` | App users with roles: Admin, Manager, Staff |
| `customers` | Customer records with Aadhaar, phone, type |
| `companies` | Supplier companies with GSTIN |
| `categories` | Product categories |
| `units` | Units of measurement (kg, litre, bag, etc.) |
| `products` | Products linked to company, category, unit; includes HSN & GST rate |
| `stock` | Current stock quantity and reorder level per product |
| `stock_movements` | Audit log of all stock in/out movements |
| `product_prices` | Purchase & selling price history with active flag |
| `purchases` | Purchase orders with company, date, invoice number |
| `purchase_items` | Line items per purchase |
| `sales` | Sales invoices with customer, date, invoice number |
| `sale_items` | Line items per sale, including CGST & SGST amounts |

---

## 🔌 API Endpoints

All API routes are prefixed with `/api`. Protected routes require a `Bearer <token>` in the `Authorization` header.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Login — returns JWT |
| POST | `/api/auth/register` | ❌ | Register new user |

### Customers
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/customers` | ✅ | List all customers |
| GET | `/api/customers/:id` | ✅ | Get customer by ID |
| POST | `/api/customers` | ✅ | Create customer |
| PUT | `/api/customers/:id` | ✅ | Update customer |
| DELETE | `/api/customers/:id` | ✅ | Delete customer |

### Companies
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/companies` | ✅ | List all companies |
| GET | `/api/companies/:id` | ✅ | Get company by ID |
| POST | `/api/companies` | ✅ | Create company |
| PUT | `/api/companies/:id` | ✅ | Update company |
| DELETE | `/api/companies/:id` | ✅ | Delete company |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | ✅ | List all products |
| GET | `/api/products/:id` | ✅ | Get product |
| POST | `/api/products` | ✅ | Create product |
| PUT | `/api/products/:id` | ✅ | Update product |
| DELETE | `/api/products/:id` | ✅ | Delete product |
| GET | `/api/products/categories` | ✅ | List categories |
| POST | `/api/products/categories` | ✅ | Create category |
| GET | `/api/products/units` | ✅ | List units |
| POST | `/api/products/units` | ✅ | Create unit |

### Stock
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/stock` | ✅ | List all stock levels |
| GET | `/api/stock/:productId` | ✅ | Get stock for a product |
| PUT | `/api/stock/:productId` | ✅ | Update stock quantity |
| POST | `/api/stock/movement` | ✅ | Record a manual stock movement |
| GET | `/api/stock/:productId/movements` | ✅ | Get movement history |

### Prices
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/prices` | ✅ | List current prices |
| GET | `/api/prices/:productId` | ✅ | Get prices for product |
| POST | `/api/prices` | ✅ | Set new price |
| PUT | `/api/prices/:id` | ✅ | Update price entry |
| GET | `/api/prices/:productId/history` | ✅ | Price history |

### Purchases
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/purchases` | ✅ | List all purchases |
| GET | `/api/purchases/:id` | ✅ | Get purchase detail |
| POST | `/api/purchases` | ✅ | Create purchase |
| DELETE | `/api/purchases/:id` | ✅ | Delete purchase |

### Sales
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/sales` | ✅ | List all sales |
| GET | `/api/sales/:id` | ✅ | Get sale detail |
| POST | `/api/sales` | ✅ | Create sale invoice |
| DELETE | `/api/sales/:id` | ✅ | Delete sale |

### Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | ✅ | Summary KPIs |
| GET | `/api/dashboard/low-stock` | ✅ | Low stock alerts |
| GET | `/api/dashboard/recent-sales` | ✅ | Recent sales list |
| GET | `/api/dashboard/recent-purchases` | ✅ | Recent purchases list |

### WhatsApp
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/whatsapp/status` | ✅ | WhatsApp connection status + QR code |
| POST | `/api/whatsapp/send-document` | ✅ | Send PDF invoice to a phone number |

---

## ⚙️ Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher (v24 recommended)
- [PostgreSQL](https://www.postgresql.org/) v14 or higher
- A WhatsApp account for invoice delivery (optional)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd shri-amman-agro
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shri_amman_agro
JWT_SECRET=your_super_secret_key_change_this
```

### 4. Create the PostgreSQL database

```sql
CREATE DATABASE shri_amman_agro;
```

> The tables and schema are auto-created on first server start — no manual migrations needed.

---

## ▶️ Running the App

```bash
npm start
```

The server starts on [http://localhost:3000](http://localhost:3000).

- **Login Page**: `http://localhost:3000`
- **Dashboard**: `http://localhost:3000/dashboard.html`

---

## 📱 WhatsApp Integration

The app uses `whatsapp-web.js` to send PDF invoices directly to customers.

### First-time setup

1. Start the server with `npm start`
2. Open the Dashboard → look for the **WhatsApp Status** card
3. Scan the QR code with your WhatsApp mobile app
4. Once connected, invoices can be sent from the **Selling** page

### Session persistence

- WhatsApp session is saved to `.wwebjs_auth/session-saat-agro/`
- On subsequent restarts, WhatsApp reconnects automatically without re-scanning
- If the session expires, a fresh QR code appears on the Dashboard

> **Note**: `.wwebjs_auth/` is listed in `.gitignore` and should never be committed.

---

## 🐛 Known Issues & Fixes

### `EBUSY: resource busy or locked` on Windows startup

**Symptom**: Server crashes on start with an error pointing to `LocalAuth.js` trying to delete a file like `first_party_sets.db`.

**Cause**: Windows holds file handles open when Puppeteer/Chrome closes. The `LocalAuth.logout()` method tries to immediately delete the session folder while files are still locked.

**Fix applied in `whatsappService.js`**:
- `LocalAuth.logout()` is wrapped to catch `EBUSY`/`EPERM` errors instead of crashing
- A 2-second delayed cleanup (`clearSessionDir`) runs after logout/auth-failure to allow Chrome to fully release file handles
- `rmMaxRetries: 10` is set on `LocalAuth` for extra resilience

---

## 📄 License

ISC — Internal use for Shri Amman Agro Traders.
