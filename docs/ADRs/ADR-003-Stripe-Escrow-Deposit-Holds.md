# ADR-003: Stripe Manual Capture Engine for Security Deposit Escrow

## Status
Accepted

## Context
Hyperlocal item borrowing requires protecting item lenders against damage, theft, or non-return of items without charging high upfront security deposits directly to borrowers' bank accounts.

## Decision
We integrated **Stripe PaymentIntents** using `capture_method: 'manual'`:
1. **Authorization Hold**: Created when a lender accepts a borrow request. This reserves deposit funds on the borrower's card without capturing money immediately.
2. **Automated Release**: Triggered via BullMQ background worker 24 hours after the return QR scan if no dispute is raised.
3. **Capture on Dispute**: Executed if the lender raises a verified damage claim during return inspection.

## Consequences
### Positive
- Zero upfront cash outlay required from borrowers unless damage occurs.
- Guarantees financial protection for item lenders.
- Fully automated release via background BullMQ worker pool.
