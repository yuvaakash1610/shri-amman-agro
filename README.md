<div align="center">

# 🌾 Shri Amman Agro Traders
### *Smart Enterprise Resource & POS Management System*

[![Node.js](https://img.shields.io/badge/Node.js-v24.0+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![WhatsApp Cloud API](https://img.shields.io/badge/WhatsApp_Cloud_API-Meta_Business-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://developers.facebook.com/docs/whatsapp/cloud-api)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

---

A full-stack, enterprise POS and inventory management web application engineered for **Shri Amman Agro Traders** to automate sales billing, stock tracking, purchase auditing, customer analytics, GST calculations, and automated WhatsApp invoice delivery in both local and cloud environments.

</div>

---

## ⚡ Key Features

| Module | Description |
|---|---|
| 🔐 **Authentication & Security** | JWT authentication, bcrypt password hashing, role-based access control (Admin, Manager, Staff), and secure self-service password reset. |
| 📊 **Real-time Analytics Dashboard** | Live KPIs, sales vs. purchase charts, low-stock warnings, hover breakdown popovers, and product margin profitability analytics. |
| 🧾 **Smart POS & Billing** | Multi-item cart builder with automatic default selling prices, stock validation, and CGST/SGST tax breakdown. |
| 💬 **Dual WhatsApp Engine** | **Cloud (Vercel)**: Official Meta WhatsApp Cloud API.<br>**Local**: `whatsapp-web.js` with live QR code pairing. |
| 🖨️ **Print & PDF Invoicing** | Instant client-side A4 PDF generation (`html2pdf`) and 80mm thermal receipt printing (`window.print`). |
| 👥 **Customer Directory** | Customer profiles with masked Aadhaar numbers, phone search, address records, and purchase history. |
| 🏢 **Supplier & Vendor Hub** | Vendor directory with GSTIN numbers, contact persons, and purchase tracking. |
| 📦 **Stock & Inventory Control** | Product categorization, unit masters, reorder alerts, and complete movement audit trails. |
| 💰 **Price Management** | Dual purchase & selling price configuration with active/historical price logging. |

---

## 🛠️ Technology Architecture

```
                       +---------------------------------------+
                       |        Frontend (Vanilla Stack)       |
                       |       HTML5 + CSS3 + JS (ES6+)        |
                       +-------------------+-------------------+
                                           |
                                      REST API (JWT)
                                           v
                       +---------------------------------------+
                       |        Backend (Node.js/Express)      |
                       +-------------------+-------------------+
                                           |
           +-------------------------------+-------------------------------+
           |                               |                               |
           v                               v                               v
+----------------------+       +-----------------------+       +-----------------------+
|    PostgreSQL DB     |       | Meta WhatsApp Cloud   |       |   whatsapp-web.js     |
| (Neon / Local PG)    |       |   API (Vercel Mode)   |       |     (Local Mode)      |
+----------------------+       +-----------------------+       +-----------------------+
```

### **Backend**
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js v5 (configured for long-running servers and Vercel serverless functions)
- **Database**: PostgreSQL (via `pg` connection pool with SSL support)
- **Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS middleware
- **WhatsApp Services**:
  - **Cloud**: Meta WhatsApp Business Platform Cloud API (`whatsappCloudService.js`)
  - **Local**: `whatsapp-web.js` + Puppeteer headless client + `qrcode`

### **Frontend**
- **Core**: Semantic HTML5, Vanilla CSS3 (glassmorphism, zebra tables, micro-animations, print CSS)
- **Logic**: Modular ES6+ JavaScript, Chart.js analytics, `html2pdf.js` client-side invoice generation
- **Design System**: Tailored agricultural green palette with accessible contrast tokens

---

## 📁 Repository Structure

```
shri-amman-agro/
├── api/
│   └── index.js                  # Vercel serverless entry point forwarding to Express app
├── backend/
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool & auto-migration builder
│   ├── controllers/              # Business logic controllers
│   │   ├── authController.js     # Login, registration, password reset, getMe
│   │   ├── customerController.js # Customer CRUD & secure search
│   │   ├── companyController.js  # Vendor / company management
│   │   ├── productController.js  # Products, categories, units
│   │   ├── stockController.js    # Stock balances & movement logs
│   │   ├── priceController.js    # Price masters & historical pricing
│   │   ├── purchaseController.js # Vendor purchasing transactions
│   │   ├── saleController.js     # POS sales & invoice creation
│   │   └── dashboardController.js# Real-time analytics & KPIs
│   ├── middlewares/
│   │   └── authMiddleware.js     # JWT Bearer token authentication & role checks
│   ├── routes/                   # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── productRoutes.js
│   │   ├── stockRoutes.js
│   │   ├── priceRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── whatsappRoutes.js     # Dynamic dispatcher (Cloud API vs. Local)
│   ├── services/
│   │   ├── whatsappCloudService.js # Official Meta WhatsApp Cloud API integration
│   │   └── whatsappService.js      # Local whatsapp-web.js engine
│   └── server.js                 # Core Express app & static route bindings
├── frontend/
│   ├── css/
│   │   └── style.css             # Main stylesheet & responsive layout tokens
│   ├── js/                       # Page-specific frontend controllers
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── forgot-password.js
│   │   ├── dashboard.js
│   │   ├── customers.js
│   │   ├── companies.js
│   │   ├── products.js
│   │   ├── stock.js
│   │   ├── prices.js
│   │   ├── purchasing.js
│   │   ├── selling.js
│   │   └── nav.js
│   ├── images/
│   │   └── logo.png
│   ├── index.html                # Login page
│   ├── register.html             # Account registration page
│   ├── forgot-password.html      # Password reset page
│   ├── dashboard.html            # Analytics dashboard
│   ├── customers.html            # Customer directory
│   ├── companies.html            # Supplier directory
│   ├── products.html             # Product catalog
│   ├── stock.html                # Stock inventory & movements
│   ├── prices.html               # Price master
│   ├── purchasing.html           # Purchases & stock replenishment
│   └── selling.html              # POS, GST cart, PDF & WhatsApp billing
├── vercel.json                   # Vercel serverless rewrite rules
├── package.json
└── README.md
```

---

## 🔌 API Reference Highlights

All endpoints accept and return JSON payloads. Protected routes require `Authorization: Bearer <token>`.

| Route | Method | Access | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticate user & issue JWT |
| `/api/auth/register` | `POST` | Public | Register a new user account |
| `/api/auth/reset-password` | `POST` | Public | Reset password with registered email |
| `/api/auth/me` | `GET` | Protected | Fetch authenticated user profile |
| `/api/customers` | `GET / POST` | Protected | List all customers or add a new customer |
| `/api/customers/search` | `POST` | Protected | Secure search by phone, Aadhaar, name, or ID |
| `/api/products` | `GET / POST` | Protected | Retrieve product catalog or create new product |
| `/api/stock` | `GET / PUT` | Protected | View current inventory levels or adjust stock |
| `/api/prices/:productId` | `GET / POST` | Protected | Fetch current price or insert price entry |
| `/api/sales` | `GET / POST` | Protected | List sales history or record new sale |
| `/api/purchases` | `GET / POST` | Protected | List purchase history or record vendor invoice |
| `/api/dashboard/stats` | `GET` | Protected | Retrieve real-time summary statistics |
| `/api/whatsapp/status` | `GET` | Protected | Status (Meta Cloud API in cloud, QR in local) |
| `/api/whatsapp/send` | `POST` | Protected | Dispatch invoice PDF & message to WhatsApp |
| `/api/whatsapp/logout` | `POST` | Protected | Unpair local WhatsApp session & refresh QR |

---

## ☁️ Vercel Deployment Configuration

When deploying on **Vercel**, configure the following environment variables in **Project Settings -> Environment Variables**:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string (e.g. `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`) |
| `JWT_SECRET` | **Yes** | Secret key for signing and verifying JWT tokens |
| `NODE_ENV` | **Yes** | Set to `production` |
| `WHATSAPP_CLOUD_TOKEN` | Optional | Meta WhatsApp Business Access Token for Cloud invoice delivery |
| `WHATSAPP_PHONE_NUMBER_ID` | Optional | WhatsApp Business Phone Number ID from Meta Developer Portal |
| `WHATSAPP_API_VERSION` | Optional | Meta Graph API Version (defaults to `v21.0`) |

---

## ⚙️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14.0 or higher) or Neon connection string

### Setup Steps

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
   *(Or specify `DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require`)*

4. **Initialize Database & Start App**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser. Database tables will be automatically created on startup.

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
