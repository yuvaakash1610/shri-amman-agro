<div align="center">

# 🌾 Shri Amman Agro Traders
### *Smart Enterprise Resource & POS Management System*

[![Node.js](https://img.shields.io/badge/Node.js-v24.0+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![WhatsApp API](https://img.shields.io/badge/WhatsApp_API-Integrated-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/pedroslopez/whatsapp-web.js)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

---

A state-of-the-art, full-stack enterprise web application designed for **Shri Amman Agro Traders** to automate inventory management, sales invoicing, purchase tracking, customer analytics, GST calculations, and automated WhatsApp invoice dispatching.

[Explore Features](#-key-features) • [Deployment Guide](#-free-deployment-guide) • [Setup & Installation](#-getting-started) • [API Reference](#-api-endpoints)

</div>

---

## ⚡ Key Features

| Module | Description |
|---|---|
| 🔐 **Authentication & Security** | JWT-based auth with bcrypt password hashing & multi-role access control (Admin, Manager, Staff) |
| 📊 **Real-time Analytics Dashboard** | Live KPIs, sales/purchase graphs, low-stock warnings, hover popovers & product profitability breakdown |
| 🧾 **Smart POS & Sales** | Fast cart creation with auto-filled prices from Price Management, manual overrides, & auto GST calculation |
| 📄 **Instant PDF & WhatsApp Dispatch** | Auto-generate printable invoices and send PDF bills directly to customer WhatsApp |
| 👥 **Customer Management** | Track customer profiles, Aadhaar numbers, phone numbers, addresses, and purchase histories |
| 🏢 **Supplier & Company Directory** | Manage vendor details, GSTINs, and purchase records |
| 📦 **Inventory & Stock Tracking** | Product categorization, unit management, reorder alerts, & full stock movement audit trails |
| 💰 **Price Management Engine** | Dual tracking for purchase & selling prices with active/historical price logging |

---

## 🛠️ Technology Architecture

```
                      +-----------------------------+
                      |   Frontend (Vanilla Stack)   |
                      |   HTML5 + CSS3 + JS (ES6+)  |
                      +--------------+--------------+
                                     |
                                REST API (JWT)
                                     v
                      +-----------------------------+
                      |    Backend (Node.js/Express)|
                      +--------------+--------------+
                                     |
         +---------------------------+---------------------------+
         |                                                       |
         v                                                       v
+------------------+                                   +-------------------+
|  PostgreSQL DB   |                                   |  WhatsApp Web.js  |
|  (Neon/Render)   |                                   |  (Automated PDF)  |
+------------------+                                   +-------------------+
```

### **Backend**
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js v5
- **Database**: PostgreSQL (via native `pg` connection pool)
- **Security**: JSON Web Tokens (`jsonwebtoken`), `bcrypt` hashing, CORS, Auth Middlewares
- **Automation**: `whatsapp-web.js` + Puppeteer headless client + `qrcode`

### **Frontend**
- **Core**: Vanilla HTML5, Modern CSS3 (Zebra tables, Glassmorphism, Micro-animations)
- **Logic**: Modular JavaScript ES6+, Dynamic Chart.js integration
- **Design System**: Tailored HSL green palette inspired by modern agricultural tech

---

## 📁 Repository Structure

```
shri-amman-agro/
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool & auto schema builder
│   ├── controllers/              # Request handlers for all modules
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
│   ├── middlewares/              # JWT bearer token verification
│   │   └── authMiddleware.js
│   ├── routes/                   # Express API routers
│   ├── services/                 # WhatsApp client lifecycle & PDF engine
│   │   └── whatsappService.js
│   └── server.js                 # Express app initialization
├── frontend/
│   ├── css/                      # Global modern stylesheets & responsive tokens
│   ├── js/                       # Page specific interactive scripts
│   ├── index.html                # Login portal
│   ├── register.html             # User registration
│   ├── dashboard.html            # Analytics dashboard
│   ├── customers.html            # Customer directory
│   ├── companies.html            # Supplier directory
│   ├── products.html             # Product management
│   ├── stock.html                # Stock inventory
│   ├── prices.html               # Price master
│   ├── purchasing.html           # Vendor purchases
│   └── selling.html              # POS & WhatsApp billing
├── .env                          # Local environment variables
├── package.json
└── README.md
```

---

## 🗄️ Database Architecture

The schema is automatically provisioned on server startup.

```mermaid
erDiagram
    USERS ||--o{ SALES : creates
    CUSTOMERS ||--o{ SALES : receives
    COMPANIES ||--o{ PURCHASES : supplies
    PRODUCTS ||--o{ PURCHASE_ITEMS : contains
    PRODUCTS ||--o{ SALE_ITEMS : contains
    PRODUCTS ||--|| STOCK : has
    PRODUCTS ||--o{ PRODUCT_PRICES : priced_at

    USERS {
        int user_id PK
        string full_name
        string username
        string password_hash
        string role
    }
    PRODUCTS {
        int product_id PK
        string product_code
        string product_name
        string hsn_code
        decimal gst_rate
    }
    STOCK {
        int stock_id PK
        int product_id FK
        decimal quantity
        decimal min_reorder_level
    }
```

---

## 🔌 API Reference Highlights

All endpoints expect JSON payloads and return JSON responses. Protected routes require `Authorization: Bearer <token>`.

| Route | Method | Access | Function |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticate user & get JWT |
| `/api/customers` | `GET / POST` | Protected | Fetch list or create customer |
| `/api/products` | `GET / POST` | Protected | Retrieve catalog or add product |
| `/api/stock` | `GET / PUT` | Protected | Fetch inventory or adjust stock level |
| `/api/prices/:productId`| `GET / POST` | Protected | Fetch current selling price or add price entry |
| `/api/sales` | `POST` | Protected | Finalize invoice, compute GST, adjust stock |
| `/api/whatsapp/status` | `GET` | Protected | Connection status & live QR code |
| `/api/whatsapp/logout` | `POST` | Protected | Unpair WhatsApp session & regenerate QR |

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14.0 or higher)

### Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yuvaakash1610/shri-amman-agro.git
   cd shri-amman-agro
   ```

2. **Install project dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=shri_amman_agro
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Initialize Database**
   Create the database in PostgreSQL:
   ```sql
   CREATE DATABASE shri_amman_agro;
   ```
   *(Tables are automatically created when you start the server)*

5. **Run the Application**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

---

## 🚀 Free Deployment Guide

You can deploy the complete stack for **100% FREE** using Render and Neon PostgreSQL:

### Step 1: Deploy Database (Neon.tech - Recommended Free PostgreSQL)
1. Go to [Neon.tech](https://neon.tech/) and create a free PostgreSQL database instance.
2. Copy your **PostgreSQL Connection String** (e.g. `postgres://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`).

### Step 2: Deploy Backend (Render.com)
1. Push your code to a GitHub repository (`https://github.com/yuvaakash1610/shri-amman-agro`).
2. Go to [Render.com](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repo `yuvaakash1610/shri-amman-agro`.
4. Set Build Command: `npm install`
5. Set Start Command: `node backend/server.js`
6. Add Environment Variables on Render:
   - `PORT` = `3000`
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (or paste full `DATABASE_URL` from Neon)
   - `JWT_SECRET` = `your_secure_secret_key`

### Step 3: Serve Frontend
- Render automatically serves static HTML/CSS/JS frontend files out-of-the-box directly from the backend server!

---

## 🧑‍💻 Author & Developer

<div align="center">

### **Yuvaakash Kannan**
*Full Stack Developer & Software Engineer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Yuvaakash_Kannan-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yuvaakash-kannan-450751360/)
[![GitHub](https://img.shields.io/badge/GitHub-yuvaakash1610-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yuvaakash1610)

</div>

---

<div align="center">
  <sub>Built with ❤️ for <b>Shri Amman Agro Traders</b>. ISC Licensed.</sub>
</div>
