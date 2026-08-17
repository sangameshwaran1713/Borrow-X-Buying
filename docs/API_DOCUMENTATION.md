# 📖 Borrow-X-Buying API Endpoint Reference Specification

Base URL: `http://localhost:5000/api`

## Authentication & Security (`/api/auth`)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new user. Returns short-lived access token and sets `refreshToken` cookie. |
| `/api/auth/login` | `POST` | Public | User login. Returns access token or prompts for 2FA. |
| `/api/auth/refresh-token` | `POST` | Cookie | Rotates refresh token cookie and issues new access token. |
| `/api/auth/logout` | `POST` | Cookie | Wipes `refreshToken` cookie and clears DB token reference. |
| `/api/auth/2fa/setup` | `POST` | Bearer | Generates TOTP secret and QR code data URL. |
| `/api/auth/2fa/verify` | `POST` | Bearer | Verifies TOTP code and generates 10 recovery codes. |
| `/api/auth/2fa/authenticate`| `POST` | Public | Validates TOTP code during 2FA login flow. |
| `/api/auth/me` | `GET` | Bearer | Fetches authenticated user profile and verification tier. |

## Financial Escrow Payments (`/api/payments`)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/payments/create-hold` | `POST` | Bearer | Creates Stripe PaymentIntent with `capture_method: 'manual'`. |
| `/api/payments/capture` | `POST` | Bearer | Captures deposit hold funds upon damage dispute confirmation. |
| `/api/payments/release` | `POST` | Bearer | Cancels deposit hold upon verified item return scan. |
| `/api/payments/webhook` | `POST` | Stripe Sig| Webhook event processing. |

## Real-Time Chat Messaging (`/api/chat`)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/chat/:requestId` | `GET` | Bearer | Fetches paginated chat history for borrow request. |
| `/api/chat/:requestId` | `POST` | Bearer | Sends text or image attachment message. |
| `/api/chat/:requestId/read`| `POST` | Bearer | Updates message read receipts (`readAt`). |

## Geospatial Listings & Items (`/api/items`)

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/items/nearby` | `GET` | Public | Redis-cached geospatial 2dsphere item search (300s TTL). |
| `/api/items/availability/:itemId` | `GET` | Public | Fetches blackout dates and availability calendar. |
