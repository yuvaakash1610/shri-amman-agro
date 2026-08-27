<div align="center">

# 🌾 Shri Amman Agro Traders — POS & ERP System

### *A production-grade full-stack web application built from scratch*

[![Node.js](https://img.shields.io/badge/Node.js-v24+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![OpenWA](https://img.shields.io/badge/OpenWA-Railway_Hosted-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://openwa.dev/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

<br>

> **🎓 A real-world engineering project** — Not a tutorial. Not a CRUD demo.
> This is a fully deployed, production-running business application with real users, real data, and real WhatsApp invoice delivery.

</div>

---

## 🚀 What is This?

A **full-stack Point of Sale (POS) and ERP system** built for a real agricultural trading business. It replaces a manual paper-based billing system with a fully digitized, cloud-deployed web app — complete with inventory management, GST billing, PDF invoice generation, and automated WhatsApp delivery.

If you're an engineering student, this repo will show you:
- How **real REST APIs** are structured and secured with JWT
- How **serverless functions** work on Vercel with PostgreSQL (Neon)
- How to build **multi-page web apps** without React/Angular (pure Vanilla JS)
- How **WhatsApp automation** works in production using OpenWA over REST
- How to **deploy and debug** a full-stack app on the cloud

---

## ⚡ Feature Matrix

| Module | What It Does | Stack Used |
|---|---|---|
| 🔐 **Auth & Security** | JWT login, bcrypt hashing, role-based access, password reset | `jsonwebtoken`, `bcryptjs` |
| 📊 **Live Dashboard** | KPI cards, revenue charts, low-stock alerts, profit margins | `Chart.js`, custom REST aggregation |
| 🧾 **POS & Billing** | Multi-item cart, stock validation, CGST/SGST tax engine | Vanilla JS, Express |
| 💬 **WhatsApp Invoicing** | Auto-send PDF invoice to customer's WhatsApp number | OpenWA (Railway) + REST API |
| 🖨️ **PDF & Thermal Print** | A4 PDF generation and 80mm thermal receipt printing | `html2pdf.js`, `window.print` |
| 👥 **Customer CRM** | Profiles with masked Aadhaar, phone search, purchase history | PostgreSQL, REST |
| 🏢 **Vendor Hub** | Supplier directory with GSTIN, contacts, purchase tracking | PostgreSQL, REST |
| 📦 **Inventory Control** | Product catalogue, unit masters, stock movement audit trail | PostgreSQL, REST |
| 💰 **Price Management** | Dual purchase/selling price config with historical logging | PostgreSQL, REST |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT BROWSER                        │
│          HTML5 + CSS3 + Vanilla ES6+ JavaScript         │
│          Chart.js   │   html2pdf.js   │   fetch API     │
└────────────────────┬────────────────────────────────────┘
                     │  HTTPS / REST API (Bearer JWT)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              VERCEL SERVERLESS FUNCTIONS                 │
│              Node.js + Express.js v5                     │
│                                                         │
│  /api/auth     /api/customers    /api/products          │
│  /api/sales    /api/purchases    /api/stock             │
│  /api/prices   /api/dashboard    /api/whatsapp          │
│  JWT Middleware + Role-Based Access Control (RBAC)      │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────┐        ┌──────────────────────────────┐
│  NEON POSTGRES  │        │  OPENWA INSTANCE (Railway)   │
│  Cloud Database │        │  WhatsApp Web REST Gateway   │
│  Auto-migrated  │        │  Session: 9491efe3-...        │
│  Tables on boot │        │  Phone:   +91 91760 18007    │
└─────────────────┘        └──────────────────────────────┘
```

---

## 🧠 Tech Stack — Deep Dive

### Backend
```
Runtime:      Node.js v24+
Framework:    Express.js v5 (serverless-compatible)
Database:     PostgreSQL via pg pool (Neon Cloud with SSL)
Auth:         JSON Web Tokens (HS256) + bcryptjs (salt=10)
Middleware:   CORS, express.json (10MB limit for PDF base64)
WhatsApp:     OpenWA REST API (self-hosted on Railway)
```

### Frontend
```
Core:         Semantic HTML5 + Vanilla CSS3 + ES6+ JavaScript
Charts:       Chart.js (line, bar, doughnut)
PDF:          html2pdf.js (client-side A4 + thermal 80mm)
Design:       Glassmorphism, CSS custom properties, animations
API Calls:    Fetch API with JWT Bearer token headers
```

### Infrastructure
```
Deployment:   Vercel (serverless edge functions)
Database:     Neon Tech (PostgreSQL-compatible, always-on)
WhatsApp:     Railway (OpenWA Docker container, WebSocket QR)
CI/CD:        GitHub → Vercel auto-deploy on push to main
```

---

## 📁 Project Structure

```
shri-amman-agro/
│
├── api/
│   └── index.js                  # Vercel serverless entry → Express app
│
├── backend/
│   ├── config/
│   │   └── db.js                 # pg Pool + auto-CREATE TABLE IF NOT EXISTS
│   │
│   ├── controllers/              # Pure business logic (no Express req/res coupling)
│   │   ├── authController.js     # login, register, resetPassword, getMe
│   │   ├── customerController.js # CRUD + secure Aadhaar-masked search
│   │   ├── companyController.js  # Vendor / supplier management
│   │   ├── productController.js  # Product catalog, categories, units
│   │   ├── stockController.js    # Inventory levels + movement audit
│   │   ├── priceController.js    # Dual price master + history log
│   │   ├── purchaseController.js # Vendor purchases + stock replenishment
│   │   ├── saleController.js     # POS sales, GST engine, invoice records
│   │   └── dashboardController.js# Real-time KPIs + chart data aggregation
│   │
│   ├── middlewares/
│   │   └── authMiddleware.js     # JWT verification + role enum check
│   │
│   ├── routes/                   # Express Router definitions (thin, just wires controllers)
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── productRoutes.js
│   │   ├── stockRoutes.js
│   │   ├── priceRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── whatsappRoutes.js     # POST /send  GET /status  POST /logout
│   │
│   ├── services/
│   │   ├── whatsappCloudService.js  # ← OpenWA REST client (active on Vercel)
│   │   └── whatsappService.js       # ← Local whatsapp-web.js + Puppeteer QR
│   │
│   └── server.js                 # App bootstrap, middleware stack, static serve
│
├── frontend/
│   ├── css/
│   │   └── style.css             # Design system: tokens, glassmorphism, print CSS
│   │
│   ├── js/                       # One JS controller per page
│   │   ├── login.js / register.js / forgot-password.js
│   │   ├── dashboard.js          # Chart.js + KPIs + WA status
│   │   ├── customers.js / companies.js
│   │   ├── products.js / stock.js / prices.js
│   │   ├── purchasing.js
│   │   ├── selling.js            # Cart engine + PDF gen + WA dispatch
│   │   └── nav.js
│   │
│   ├── index.html                # Login
│   ├── register.html
│   ├── forgot-password.html      # Direct password reset (no email token)
│   ├── dashboard.html
│   ├── customers.html / companies.html
│   ├── products.html / stock.html / prices.html
│   ├── purchasing.html
│   └── selling.html              # Main POS — cart, GST, PDF, WA
│
├── vercel.json                   # Rewrite rules: /* → /api/index (SPA style)
├── package.json
└── README.md
```

---

## 🔌 REST API Reference

All protected routes require: `Authorization: Bearer <jwt_token>`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `POST` | `/api/auth/register` | Create new user account |
| `POST` | `/api/auth/reset-password` | Reset password by email (no OTP) |
| `GET` | `/api/auth/me` | Get current user profile |

### Business Modules (all protected)
| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/customers` | List all / create customer |
| `POST` | `/api/customers/search` | Search by name, phone, Aadhaar |
| `GET/POST` | `/api/products` | Product catalog CRUD |
| `GET/PUT` | `/api/stock` | View inventory / adjust stock |
| `GET/POST` | `/api/prices/:productId` | Fetch or insert price entry |
| `GET/POST` | `/api/sales` | Sales history / record new sale |
| `GET/POST` | `/api/purchases` | Purchase history / add purchase |
| `GET` | `/api/dashboard/stats` | Real-time KPI aggregation |

### WhatsApp
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/whatsapp/status` | Connection status + session info |
| `POST` | `/api/whatsapp/send` | Send invoice PDF to customer WhatsApp |
| `POST` | `/api/whatsapp/logout` | Clear local WA session |

### OpenWA Payload Schema (Discovered via live API probing)
```json
// Text message → POST /api/sessions/:uuid/messages/send-text
{ "chatId": "919894718182@c.us", "text": "Hello from Shri Amman Agro!" }

// PDF invoice → POST /api/sessions/:uuid/messages/send-document
{
  "chatId": "919894718182@c.us",
  "base64": "<base64_encoded_pdf>",
  "mimetype": "application/pdf",
  "filename": "Invoice-2024.pdf",
  "caption": "📄 Your invoice from Shri Amman Agro Traders"
}
```

---

## 🔧 WhatsApp Integration — How It Actually Works

This was the most complex engineering challenge. Here's the actual architecture:

```
PRODUCTION (Vercel)                     LOCAL DEV
      │                                     │
      ▼                                     ▼
OpenWA REST API                     whatsapp-web.js
(Railway hosted)                    (Puppeteer + QR scan)
      │                                     │
      ▼                                     ▼
GET /api/sessions                   QR code in browser
→ Resolve "default" to UUID         → Pair with WhatsApp
→ Cache UUID in memory              → Send via WA Web protocol
      │                                     │
      ▼                                     ▼
POST .../messages/send-document     sendDocument() method
{ chatId, base64, mimetype... }     { chatId, base64File... }
```

**Key discovery**: OpenWA on Railway uses session **UUIDs** internally, not names.
The service auto-resolves `"default"` → UUID via `GET /api/sessions` on first call, then caches it.

---

## ☁️ Deploying to Vercel

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require` |
| `JWT_SECRET` | ✅ Yes | Any long random string for signing tokens |
| `NODE_ENV` | ✅ Yes | `production` |
| `OPENWA_API_URL` | ✅ Yes | `https://openwa-production-12d1.up.railway.app` |
| `OPENWA_API_KEY` | ✅ Yes | Your OpenWA instance API key |
| `OPENWA_SESSION_ID` | ✅ Yes | `default` (auto-resolved to UUID at runtime) |

### One-click Flow
```bash
# 1. Push to GitHub main branch
git push origin main

# 2. Vercel auto-detects push and deploys
# → Runs: node api/index.js (serverless)
# → Connects to Neon PostgreSQL
# → Creates tables if missing (idempotent migrations)
# → Mounts all /api/* routes
# → Serves frontend statically
```

---

## 🛠️ Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+ (local) or Neon connection string

### Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/yuvaakash1610/shri-amman-agro.git
cd shri-amman-agro

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shri_amman_agro
JWT_SECRET=your_super_secret_jwt_key_here

# OpenWA for WhatsApp (optional for local dev)
OPENWA_API_URL=https://your-openwa-instance.railway.app
OPENWA_API_KEY=your_openwa_api_key
OPENWA_SESSION_ID=default
EOF

# 4. Start the dev server
npm run dev
# → Tables auto-created on first boot
# → App running at http://localhost:3000
```

---

## 🧪 Engineering Highlights

### Problem → Solution Record

| Challenge | Root Cause | Solution |
|---|---|---|
| Vercel crash on cold start | `whatsapp-web.js` (Puppeteer) requires Chrome binary | Guard with `isVercel` flag; never `require()` on Vercel |
| DB pool killed Lambda | `pool.on('error', () => process.exit(-1))` | Removed `process.exit` from error handler |
| WA "Bad Request" | OpenWA routes need UUID, not session name `"default"` | Auto-resolve name→UUID via `GET /api/sessions` with caching |
| WA payload schema | Field names differ from docs: `body` ≠ `text`, `data` ≠ `base64` | Live API probing (13 payload variations tested) until 201 returned |

### Performance Notes
- PDF base64 strings can be **2–5MB** — the `express.json({ limit: '10mb' })` cap matters
- OpenWA session UUID is cached **in-process memory** on Vercel (re-resolved on cold starts only)
- All `CREATE TABLE IF NOT EXISTS` migrations run on app boot — **zero downtime schema changes**

---

## 📊 Database Schema (Key Tables)

```sql
users          -- id, email, password_hash, role (admin/manager/staff)
customers      -- id, name, phone, aadhaar_masked, address
companies      -- id, name, gstin, contact_person, phone
products       -- id, name, category_id, unit_id
stock          -- product_id, quantity, last_updated
prices         -- id, product_id, purchase_price, selling_price, created_at
purchases      -- id, company_id, product_id, qty, total_amount, date
sales          -- id, customer_id, invoice_number, total_amount, cgst, sgst, date
sale_items     -- id, sale_id, product_id, qty, unit_price, amount
```

---

## 🧑‍💻 Developer

<div align="center">

### **Yuvaakash Kannan**
*Full-Stack Developer | Engineering Student*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Yuvaakash_Kannan-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yuvaakash-kannan-450751360/)
[![GitHub](https://img.shields.io/badge/GitHub-yuvaakash1610-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yuvaakash1610)

</div>

---

<div align="center">
  <sub>Built with ❤️ for <b>Shri Amman Agro Traders</b>. Real users. Real data. Real problems solved.</sub>
</div>
