<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:123524,50:267344,100:D6A83E&height=220&section=header&text=Shri%20Amman%20Agro%20Traders&fontSize=36&fontColor=FFFFFF&fontAlignY=38&desc=Smarter%20Billing%20%E2%80%A2%20Inventory%20%E2%80%A2%20Business%20Insights&descAlignY=59&descSize=16" width="100%" alt="Shri Amman Agro Traders banner"/>

<a href="https://readme-typing-svg.demolab.com">
  <img src="https://readme-typing-svg.demolab.com?font=Outfit&weight=600&size=22&pause=1100&color=267344&center=true&vCenter=true&width=700&lines=Business+operations%2C+made+simpler.;A+full-stack+POS+%26+ERP+application.;Track+sales.+Manage+stock.+Understand+your+business." alt="Animated project tagline"/>
</a>

<p><strong>A practical business management platform for agricultural trading.</strong><br/>
Billing, stock control, customer and supplier records, analytics, and invoice delivery in one place.</p>

<p>
  <a href="#-features"><img src="https://img.shields.io/badge/Explore-Features-267344?style=for-the-badge&logo=github&logoColor=white" alt="Explore features"/></a>
  <a href="#-getting-started"><img src="https://img.shields.io/badge/Quick-Start-D6A83E?style=for-the-badge&logo=rocket&logoColor=white" alt="Quick start"/></a>
  <a href="https://github.com/yuvaakash1610/shri-amman-agro/issues"><img src="https://img.shields.io/badge/Report-an%20Issue-20232A?style=for-the-badge&logo=github" alt="Report an issue"/></a>
  <a href="https://github.com/yuvaakash1610/shri-amman-agro"><img src="https://img.shields.io/badge/View-Repository-111111?style=for-the-badge&logo=github" alt="View repository"/></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-24%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Frontend-Vanilla%20JS-F7DF1E?style=flat-square&logo=javascript&logoColor=111111" alt="Vanilla JavaScript"/>
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/License-ISC-4C7A57?style=flat-square" alt="ISC license"/>
</p>

</div>

---

## 🌱 About the project

**Shri Amman Agro Traders** is a full-stack Point of Sale (POS) and Enterprise Resource Planning (ERP) application designed to help an agricultural trading business move routine operations from paper-based workflows into a central digital system.

The repository contains a browser-based frontend, a Node.js/Express API, PostgreSQL database setup, JWT-based authentication, business dashboards, billing and inventory modules, and WhatsApp invoice-delivery integrations.

> **Project focus:** simplify daily business workflows while making sales, purchases, inventory, and reporting easier to manage.

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication
- Login and registration endpoints
- JWT-based protected API routes
- Password hashing with bcrypt
- User roles: Admin, Manager, and Staff
- Current-user profile endpoint and password-reset route

</td>
<td width="50%">

### 🧾 Sales & billing
- Create and review sales
- Multi-item billing workflow
- Stock-aware sales operations
- GST-oriented CGST/SGST billing, as described by the project
- PDF invoice generation and printing from the frontend

</td>
</tr>
<tr>
<td width="50%">

### 📦 Products & inventory
- Product catalogue management
- Product categories and unit masters
- Stock adjustments and movement history
- Low-stock reporting
- Purchase and sales flows connected to stock operations

</td>
<td width="50%">

### 📊 Dashboard & analytics
- Business summary statistics
- Sales trends and purchase-versus-sales views
- Top-selling product insights
- Stock-by-product and low-stock views
- Profit analytics endpoints

</td>
</tr>
<tr>
<td width="50%">

### 👥 Business records
- Customer profiles and purchase history workflows
- Company information management
- Supplier/vendor records
- Product purchase and selling price management

</td>
<td width="50%">

### 💬 Invoice delivery
- WhatsApp message/document sending route
- PDF invoice delivery support
- Local WhatsApp Web integration option
- Cloud-mode integration for serverless deployments

</td>
</tr>
</table>

## 🧰 Tech stack

| Layer | Technologies | Purpose |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript | Browser UI and business workflows |
| Charts & documents | Chart.js, html2pdf.js (documented in the project README) | Dashboard visualisation and invoice output |
| Backend | Node.js, Express 5 | REST API and application routing |
| Database | PostgreSQL, `pg`, Neon-compatible connection | Persistent business data |
| Authentication | JSON Web Tokens, bcryptjs | Token authentication and password hashing |
| Messaging | `whatsapp-web.js`, QRCode, cloud WhatsApp service | WhatsApp messaging and invoice delivery |
| Deployment configuration | Vercel configuration included | Serverless API routing and frontend rewrites |

## 🏗️ How it fits together

```mermaid
flowchart TD
    U[Staff / Manager / Admin] --> UI[Browser UI<br/>HTML • CSS • Vanilla JS]
    UI -->|HTTPS / REST| API[Express 5 API<br/>Node.js]
    API --> AUTH[JWT Authentication]
    API --> DB[(PostgreSQL)]
    API --> SALES[Sales & Billing]
    API --> STOCK[Products & Stock]
    API --> CRM[Customers & Company]
    API --> DASH[Dashboard & Analytics]
    API --> MSG[WhatsApp Integration]
    SALES --> DB
    STOCK --> DB
    CRM --> DB
    DASH --> DB
    MSG --> WA[WhatsApp service]
```

### Main backend areas

- `backend/server.js` — Express application setup and route wiring.
- `backend/config/db.js` — PostgreSQL connection pool and database initialisation.
- `backend/routes/` — route definitions for authentication, customers, products, stock, prices, purchases, sales, dashboard, and WhatsApp.
- `backend/controllers/` — business logic for API operations.
- `backend/middlewares/authMiddleware.js` — JWT authentication and role-authorization helpers.
- `backend/services/` — WhatsApp integration services.
- `frontend/` — browser interface, styling, and client-side assets.
- `api/index.js` — serverless entry point that exports the Express app.
- `vercel.json` — API and frontend rewrite rules.

## 🚀 Getting started

### Prerequisites

- Node.js and npm
- A PostgreSQL database (local or hosted)
- Git
- Optional: WhatsApp integration credentials/configuration if you plan to use invoice messaging

### 1. Clone the repository

```bash
git clone https://github.com/yuvaakash1610/shri-amman-agro.git
cd shri-amman-agro
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root. Use the variable names expected by the backend and your database provider.

```env
PORT=3000
NODE_ENV=development

# Use either DATABASE_URL or the individual DB_* settings
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# Required for JWT signing; use a long, random secret
JWT_SECRET=replace_with_a_long_random_secret

# Optional database settings when not using DATABASE_URL
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=5432
DB_SSL=false

# Optional WhatsApp mode, depending on your deployment
WHATSAPP_MODE=local
```

**Important:** These are example placeholders, not working credentials. Never commit real passwords, tokens, database URLs, customer data, WhatsApp session files, or secrets to Git.

### 4. Start the application

```bash
npm run dev
```

The package scripts start `backend/server.js`. If the server starts successfully, open the local URL printed by the application (the default port is `3000`).

> Database initialization and WhatsApp behaviour depend on environment configuration. Configure and verify those integrations before using the application with real business data.

## 🔌 API overview

The backend registers the following functional areas. The exact request bodies and response formats are defined in their route and controller files.

| Area | Example routes | Purpose |
|---|---|---|
| Authentication | `/api/auth/login`, `/api/auth/register`, `/api/auth/me` | Sign-in, account creation, current profile |
| Customers | `/api/customers` | Customer records |
| Company | `/api/company` | Business/company details |
| Products | `/api/products` | Products, categories, units |
| Stock | `/api/stock` | Stock levels and movement records |
| Prices | `/api/prices` | Price management |
| Purchases | `/api/purchases` | Purchase records |
| Sales | `/api/sales` | Sales records |
| Dashboard | `/api/dashboard/stats`, `/api/dashboard/low-stock`, `/api/dashboard/sales-trend` | Business summaries and analytics |
| WhatsApp | `/api/whatsapp/send` | Send messages and/or invoice documents |

Most business routes use JWT authentication. The WhatsApp route has its own handling; review its implementation and deployment setup before exposing it publicly.

### Example authenticated request

```bash
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Replace the URL if your local server uses a different port or API prefix, and replace the placeholder token with a valid token from your own environment.

## 🔒 Security notes

- Keep `JWT_SECRET`, database credentials, and provider tokens in environment variables.
- Use HTTPS in deployed environments.
- Review registration and password-reset flows before public deployment.
- Confirm role checks are applied to every operation that requires elevated permissions.
- Restrict CORS to trusted origins in production instead of allowing every origin.
- Protect customer personal data; avoid exposing identity numbers or phone numbers in logs, screenshots, demos, or public documentation.
- Secure the WhatsApp send endpoint with authentication, authorization, validation, and rate limiting before exposing it to untrusted clients.
- Review database SSL configuration and dependency updates as part of deployment hardening.

## 🗺️ Roadmap ideas

- [ ] Add automated tests for authentication, billing, and inventory flows
- [ ] Add API documentation with request/response examples
- [ ] Add CI checks for linting and test execution
- [ ] Add audit logs for sensitive business actions
- [ ] Add pagination and filtering guidance for large datasets
- [ ] Add role-permission tests and rate limiting for sensitive endpoints
- [ ] Add screenshots or a short demo GIF of the actual application

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`
3. Make and test your changes.
4. Commit: `git commit -m "feat: describe your change"`
5. Push the branch and open a pull request.

For bugs or feature ideas, [open an issue](https://github.com/yuvaakash1610/shri-amman-agro/issues).

## 📄 License

This project declares the **ISC License** in `package.json`. See the repository for the applicable license text.

---

<div align="center">

### 🌾 Built to bring everyday agro-trading operations into one workflow.

<a href="#-about-the-project"><img src="https://img.shields.io/badge/Back%20to-Top-267344?style=for-the-badge&logo=github&logoColor=white" alt="Back to top"/></a>
<a href="https://github.com/yuvaakash1610/shri-amman-agro/issues"><img src="https://img.shields.io/badge/Have%20an-Idea%3F-D6A83E?style=for-the-badge&logo=lightbulb&logoColor=111111" alt="Suggest an idea"/></a>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:D6A83E,50:267344,100:123524&height=100&section=footer" width="100%" alt="Decorative footer"/>

</div>
