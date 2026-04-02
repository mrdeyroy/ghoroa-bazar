# 🛒 Ghoroa Bazar — Your Neighbourhood Grocery, Delivered Online

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ghoroa-bazar.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**Ghoroa Bazar** is a premium, full-stack MERN e-commerce platform designed to bring the fresh grocery shopping experience to your fingertips. Built with a focus on speed, security, and a "wow" user interface, it features real-time order tracking, secure COD verification, and an intelligent admin ecosystem.

---

## 🔗 Live Demo
Experience the app live: **[ghoroa-bazar.vercel.app](https://ghoroa-bazar.vercel.app/)**

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS + Vanilla CSS (Custom UI Components)
- **Animations**: Framer Motion (Smooth transitions and micro-interactions)
- **State Management**: React Context API
- **Icons**: Lucide React
- **Charts**: Recharts (Dashboard visualization)
- **Notifications**: React Hot Toast
- **Networking**: Axios + Socket.io-client

### Backend
- **Environment**: Node.js
- **Framework**: Express 5 (Latest)
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO (WebSockets)
- **Auth**: JWT (AccessToken) + HttpOnly Cookies (RefreshToken)
- **Security**: Helmet, Rate Limiter, XSS Clean, Mongo Sanitize, Bcrypt
- **Logging**: Winston + Winston Daily Rotate File
- **Media**: Cloudinary + Multer

---

## ✨ Key Features

### 👤 Customer Experience
- **Smart Auth Flow**: Secure login/signup with JWT, email OTP verification, and failed attempt lockout.
- **Product Discovery**: Advanced category filtering, live search modal, and server-side paginated product lists.
- **Dynamic Cart & Wishlist**: Real-time updates with an elegant slide-out sidebar.
- **Secure Checkout**: Support for Razorpay (Online) and Cash on Delivery (COD).
- **COD Trust System**: Multi-step OTP verification for COD orders to prevent fake orders.
- **Real-time Tracking**: Live order status updates (Placed → Packed → Shipped → Delivered) via WebSockets.
- **AI Chatbot**: Intelligent interactive assistant for product suggestions and quick help.
- **Professional Invoices**: Automated PDF generation and downloading for every order.

### 🛡️ Admin Powerhouse
- **Executive Dashboard**: Real-time analytics showing revenue trends, order counts, and user growth using interactive charts.
- **Inventory Management**: Full CRUD operations for products with instant image uploads to Cloudinary.
- **Smart Order Fulfillment**: Manage lifecycle of orders, update statuses, and trigger instant user notifications.
- **Broadcast System**: Send real-time announcements/notifications to all active users simultaneously.
- **Message Center**: Centralized hub to manage customer inquiries and contact form submissions.

---

## 📂 Project Structure

```text
ghoroa-bazar/
├── backend/
│   ├── controllers/      # Request handlers & business logic
│   ├── models/           # Mongoose schemas (User, Product, Order, etc.)
│   ├── routes/           # Express API endpoints
│   ├── middleware/       # Auth, Admin, Validation, & Security layers
│   ├── utils/            # Helper functions (Mail, Socket, Winston)
│   ├── logs/             # Success/Error log files (Production)
│   └── server.js         # Entry point (Socket.io initialization)
├── frontend/
│   ├── src/
│   │   ├── components/   # Atomic UI components (Navbar, Hero, ProductCard)
│   │   ├── pages/        # Route views (Home, Profile, AdminDashboard)
│   │   ├── context/      # Auth & Cart state management
│   │   ├── layouts/      # High-level layout wrappers
│   │   ├── constants/    # Theme & API config constants
│   │   └── utils/        # Axios & Socket instances
│   └── public/           # Static assets & icons
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB Atlas** account
- **Cloudinary** account (for images)
- **Gmail Account** (for Nodemailer/OTP)

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/mrdeyroy/ghoroa-bazar.git
cd ghoroa-bazar

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

### 4. Run Application
```bash
# Start Backend (from /backend)
npm run dev

# Start Frontend (from /frontend)
npm run dev
```

---

## 🌐 API Endpoints (Snapshot)

| Entity | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/users/login` | Login & get Access Token |
| | `POST` | `/api/users/signup` | Register & trigger email OTP |
| **Orders** | `POST` | `/api/orders` | Place Order (Online/COD) |
| | `GET` | `/api/orders/my` | Get user order history |
| **Admin** | `GET` | `/api/admin/dashboard-stats` | Fetch real-time analytics |
| **Products**| `GET` | `/api/products` | Paginated product list |
| **Communication**| `POST` | `/api/broadcast` | Send global announcement |

---

## 🔄 Key Functional Flows

### 1. Order Verification (COD)
To minimize fake orders, **Ghoroa Bazar** implements a "Trust Check":
1. User selects COD at checkout.
2. System sends a **6-digit OTP** to the verified email.
3. Order remains in `pending_verification` until the user enters the correct OTP.
4. If failed 3 times, the order is automatically cancelled.

### 2. Real-Time Synchronization
The platform leverages **Socket.io** for:
- **Admin**: Receives a notification beep and popup as soon as an order is placed.
- **User**: Order status updates (e.g., "Shipped") appear instantly without page refresh.
- **Broadcasts**: Admin "Breaking News" banners appear for all users in real-time.

---

## 🚀 Performance & Security
- **Security Headers**: Implemented using `Helmet.js`.
- **DDoS Protection**: IP-based Rate Limiter on Auth routes.
- **Data Integrity**: Input validation via `express-validator`.
- **Clean Code**: Separated concerns using Controller-Service-Route pattern.
- **Optimized Assets**: Lazy loading and optimized image serving via Cloudinary.

---

## 📸 Screenshots & UI Preview

| Home Page | Admin Dashboard |
| :---: | :---: |
| ![Hero](./admin_gb.png) | ![Dashboard](./hero_gb.png) |

---

## 🔮 Future Roadmap
- [ ] **Multi-vendor Support**: Allow different local shops to list products.
- [ ] **PWA Support**: Progressive Web App for "installable" mobile experience.
- [ ] **AI Recommendations**: Advanced ML-based product suggestions based on browsing patterns.
- [ ] **Multi-language**: Support for Bengali & other regional languages.

---

## 👨‍💻 Author

**Shibam Dey Roy**
- 🐙 [GitHub](https://github.com/mrdeyroy)
- 💼 [LinkedIn](https://linkedin.com/in/shibamdeyroy)
- 📧 [Email](mailto:shibamdeyroy02@gmail.com)

---

<div align="center">
  <p>Show some ❤️ by giving this repository a ⭐!</p>
  <p>Built with Passion ⚡ MERN Stack</p>
</div>
