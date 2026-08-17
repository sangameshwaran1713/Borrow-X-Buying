# 🏠 Borrow-X-Buying - Enterprise Hyperlocal Peer-to-Peer Platform

A production-grade, enterprise-ready MERN stack application for hyperlocal peer-to-peer item lending and borrowing with **Stripe Security Deposit Escrow**, **Socket.IO Real-Time Chat**, **Redis Caching**, **BullMQ Async Job Queues**, **Dual-Token Refresh Rotation**, **Two-Factor Authentication (2FA)**, **PWA Offline Capabilities**, and **Dark/Light Theme**.

---

## 🌟 Key Features

1. **💳 Stripe Security Deposit Escrow**:
   - Pre-authorization holds (`PaymentIntents` with `capture_method: 'manual'`).
   - Deposit lifecycle management (`HOLD_CREATED` → `RELEASED` / `CAPTURED`).
   - Stripe Webhook handling for automated payment status synchronization.

2. **💬 Real-Time In-App Messaging & Chat System**:
   - Room-based Socket.IO `/chat` namespace (`chat_<requestId>`).
   - Persistent `ChatMessage` MongoDB models with typing indicators & read receipts.

3. **🛡️ Enterprise Security & 2FA**:
   - Dual-Token Refresh Rotation (`15m` Access Token in memory, `7d` Refresh Token in `HttpOnly` `SameSite=Strict` cookie).
   - Token reuse revocation detection.
   - Two-Factor Authentication (2FA / TOTP via `speakeasy`) with 10 recovery codes.
   - Zod schema validation & NoSQL injection sanitization (`express-mongo-sanitize`).
   - Global & auth route rate limiting (`express-rate-limit`).

4. **⚡ Performance & Async Infrastructure**:
   - Redis `ioredis` caching for `/api/items/nearby` (300s TTL) with `X-Cache-Status` headers.
   - BullMQ worker queues for 24h deposit auto-release delayed jobs and email delivery.
   - Compound 2dsphere indexing for sub-50ms geospatial query execution.

5. **📱 Progressive Web App & Dark Mode**:
   - Service Worker (`sw.js`) with Stale-While-Revalidate caching strategy.
   - Web app `manifest.json` for standalone PWA mobile installation.
   - Tailwind `darkMode: 'class'` with smooth color transitions and `ThemeContext.jsx`.

6. **🧪 Test Automation & Quality Assurance**:
   - Jest unit tests for geospatial formulas (`geo.test.js`).
   - Supertest API integration suite (`api.test.js`).

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm start
```
*Backend server runs on `http://localhost:5000`.*

### 2. Run Test Suite
```bash
cd backend
npm test
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend application runs on `http://localhost:3000`.*

---

## 📑 Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Axios, Context API, Service Worker (PWA)
- **Backend:** Node.js, Express.js, MongoDB (Mongoose 2dsphere), Redis (ioredis), BullMQ, Stripe SDK, Socket.IO, Pino Logger, Zod, Speakeasy, Jest, Supertest
