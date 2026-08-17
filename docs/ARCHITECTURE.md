# 🏗️ Borrow-X-Buying: High-Level Architecture Specification

## Overview
Borrow-X-Buying is an enterprise-grade, hyperlocal peer-to-peer item sharing platform built on the MERN stack with Redis caching, BullMQ background job queues, Stripe security deposit holds, and Socket.IO real-time communication.

```
+-----------------------------------------------------------------------+
|                            CLIENT LAYER                               |
|        React 18 SPA (Vite + Tailwind CSS + PWA Service Worker)        |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|                        EDGE & INGRESS LAYER                           |
|      Cloudflare CDN / Nginx Ingress + Redis API Rate Limiting         |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|                      APPLICATION API LAYER                            |
|       Express.js REST APIs + Socket.IO Real-Time Chat Engine          |
+-------------------+---------------+-------------------+---------------+
                    |               |                   |
                    v               v                   v
+-------------------+---+  +--------+----------+  +-----+-----------+
|    DATA PERSISTENCE   |  |   ASYNC QUEUES    |  | EXTERNAL APIs   |
| MongoDB Replica Set   |  | BullMQ Workers    |  | Stripe Escrow   |
| Redis Cluster Cache   |  | Nodemailer Email  |  | Cloudinary S3   |
+-----------------------+  +-------------------+  +-----------------+
```

## Core Modules & Subsystems

1. **Authentication & Security (`/api/auth`)**:
   - Dual-Token Refresh Rotation (`HttpOnly` cookie).
   - 2FA TOTP setup (`speakeasy`) & hashed recovery codes.
   - Input sanitization via `express-mongo-sanitize` and `Zod`.
2. **Stripe Security Deposit Escrow (`/api/payments`)**:
   - Pre-authorization holds (`capture_method: 'manual'`).
   - Deposit lifecycle: `HOLD_CREATED` → `RELEASED` / `CAPTURED`.
3. **In-App Real-Time Messaging (`/api/chat` & Socket `/chat`)**:
   - Persistent `ChatMessage` collection.
   - Room-based Socket.IO broadcasting with presence engine.
4. **Caching & Async Workers**:
   - Redis `ioredis` caching for `/api/items/nearby` (300s TTL).
   - BullMQ worker queues for 24h deposit release and email notifications.
