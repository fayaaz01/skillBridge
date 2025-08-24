## Security, Privacy, and E2EE

### Threat Model
- Protect message content from server and third parties (E2EE)
- Limit metadata exposure; prevent user scraping
- Ensure verified student community without over-collecting PII

### Authentication & Verification
- Firebase Auth with email/password; 2FA optional via TOTP
- Student verification: domain whitelisting or document review
- Store only minimal verification metadata in `verifications`

### Messaging E2EE
- Use Signal-compatible protocol or libsodium:
  - Identity keypair per user (Curve25519)
  - Prekeys published via public doc `profiles/{userId}/keys`
  - Double ratchet per conversation
  - Message objects store ciphertext + nonce only
- Attachments: encrypt with symmetric key; store in Firebase Storage; key shared via E2EE message

### Privacy Controls
- No public directory; discovery only via matches
- Pseudonymous profiles; real names optional
- User can delete account: cascade delete personal data where feasible

### Access Controls
- Firestore rules: least privilege, role checks via custom claims
- Functions as controlled gateway for AI service and verification

### Data Retention
- Messages: user-controlled deletion; auto-trim older than N days (configurable)
- Logs: minimal, rotated; strip identifiers

### Compliance
- Consent for notifications and analytics; opt-out defaults where possible
- Local language notifications (Tamil/English)

