## Security, Privacy, and E2EE

### Threat Model
- Protect message content from server and third parties (E2EE)
- Limit metadata exposure; prevent user scraping
- Promote community safety via optional trust signals without over-collecting PII

### Authentication & Trust Signals
- Firebase Auth with email/password; optional phone OTP and TOTP 2FA
- Peer endorsements are stored with minimal metadata; visible to matched users
- Video/voice intros stored in Firebase Storage; default visibility to matches only

### Messaging E2EE (Signal)
- Use Signal protocol (X3DH + Double Ratchet) via libsignal-compatible library
  - Identity keypair per user (Curve25519)
  - Prekeys published via public doc `profiles/{userId}/keys` (signed prekey + one-time prekeys)
  - X3DH handshake using prekey bundle to start sessions; per-message forward secrecy
  - Double Ratchet for post-compromise security and message ordering resilience
  - Safety numbers (fingerprints) shown in UI for verification
- Attachments: encrypt with symmetric key; store in Firebase Storage; key shared via E2EE message

### Privacy Controls
- No public directory; discovery only via matches
- Pseudonymous profiles; real names optional
- User can delete account: cascade delete personal data where feasible
 - Location: precise GPS stored; shown only as approximate area to other users
 - Intros: viewable only after explicit consent approval; access is logged

### Access Controls
- Firestore rules: least privilege, role checks via custom claims
- Functions as controlled gateway for AI service, media upload signing, and prekey rotation
 - Separate location write endpoint with rate limit and permission checks

### Data Retention
- Messages: user-controlled deletion; auto-trim older than N days (configurable)
- Logs: minimal, rotated; strip identifiers

### Compliance
- Consent for notifications and analytics; opt-out defaults where possible
- Local language notifications (English/Tamil/Hindi/Arabic)
 - Google OAuth: store access/refresh tokens encrypted server-side; scope-limited to Calendar events

