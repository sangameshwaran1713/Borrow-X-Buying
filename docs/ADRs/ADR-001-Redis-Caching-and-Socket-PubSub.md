# ADR-001: Selection of Redis for Multi-Instance Socket.IO Scaling & Geospatial Caching

## Status
Accepted

## Context
The Borrow-X-Buying platform requires sub-50ms geospatial listing search response times and real-time WebSocket communication across scaled backend instances. Without a shared caching and pub/sub layer, database read operations on 2dsphere indexes spike under high load, and WebSockets cannot synchronize state across multi-instance server deployments.

## Decision
We decided to adopt **Redis** (via `ioredis`) as a dual-purpose infrastructure component:
1. **Response Caching**: Caching `/api/items/nearby` (300s TTL) and user trust score metrics with silent fallback to MongoDB if Redis is offline.
2. **Socket.IO Adapter**: Synchronizing real-time chat and notification events across all node instances via `@socket.io/redis-adapter`.

## Consequences
### Positive
- Sub-50ms search latency achieved (average 18ms on cache hit).
- Seamless horizontal scaling of Express backend instances without losing WebSocket connection state.
- Graceful degradation ensured: if Redis drops, the application falls back to direct MongoDB queries.

### Negative
- Introduced Redis cluster operational dependency in production environments.
