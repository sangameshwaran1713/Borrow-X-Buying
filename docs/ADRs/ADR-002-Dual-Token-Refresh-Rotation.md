# ADR-002: Dual-Token Refresh Rotation Strategy for OWASP Security Compliance

## Status
Accepted

## Context
Storing long-lived JWT access tokens in `localStorage` or `sessionStorage` leaves web applications vulnerable to Cross-Site Scripting (XSS) attacks. Conversely, requiring frequent user re-login degrades the user experience.

## Decision
We implemented a **Dual-Token Refresh Rotation Strategy**:
1. **Access Token**: Short-lived (15 minutes), held strictly in-memory or React component state.
2. **Refresh Token**: Long-lived (7 days), stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
3. **Reuse Detection & Revocation**: Every call to `POST /api/auth/refresh-token` validates the incoming refresh token against the active token recorded in MongoDB/Redis. If a previously invalidated refresh token is re-submitted (indicating token theft), all sessions for that user family are immediately revoked.

## Consequences
### Positive
- Protected against XSS token exfiltration.
- Automatic session revocation protects accounts against stolen refresh token replays.
- Meets OWASP Top 10 authentication security guidelines.

### Negative
- Requires `credentials: true` CORS configuration on all cross-origin requests.
