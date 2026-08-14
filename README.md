# 🏠 Borrow Instead of Buy - Hyperlocal Peer-to-Peer Platform

A full-stack MERN application for hyperlocal peer-to-peer item lending and borrowing with trust-based verification, dynamic score metrics, QR code handover passes, and real-time notifications.

---

## 🌟 Key Features

1. **Hyperlocal Item Discovery (`2DSphere` Geospatial Search)**:
   - Search tools, cameras, camping gear, and lawn care items near your exact neighborhood coordinates.
   - Filter by radius distance, rental fee, or free community share.
   - Toggle between **Grid View** and **Interactive Map View**.

2. **Digital QR Pass & Handover Verification**:
   - Automated QR Code generation upon request acceptance.
   - Instant simulation scanner for physical item pickup and return confirmation.
   - Security deposit hold & release status tracker.

3. **Dynamic Borrowability & Trust Score**:
   - Multi-dimensional trust rating (Reliability, Item Condition Accuracy, Timeliness, and Communication).
   - Recalculated dynamically upon review creation.

4. **Real-time Alert Notifications**:
   - Socket.IO WebSockets & persistent MongoDB notifications drawer.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*The Express backend server runs on `http://localhost:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The React Vite application runs on `http://localhost:3000`.*

---

## 📑 Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Axios, Context API
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Socket.IO, Multer, QRCode
