# Security Hardening Guide

## App Layer (Mobile)
- Use Signal-compatible E2EE for all messages; never log plaintext
- Store keys and sensitive tokens in secure storage (OS keystore)
- Enforce HTTPS/TLS 1.2+ only; pin Firebase domain certificates where feasible
- Implement jailbreak/root detection warnings and block risky actions
- Rate-limit sensitive actions (intro requests, location updates) client-side backoff

## Backend (Firebase/Cloud)
- Firestore rules: least privilege; server-only writes for system-owned docs (matches, trust updates)
- Cloud Functions: use IAM service accounts with minimal roles; rotate keys; avoid plaintext secrets
- Secrets: use Secret Manager; never commit to repo; environment separation (dev/stage/prod)
- Logging: redact PII; no message content logs; enable audit logs for admin actions
- DDoS: enable quotas/rate limits; add reCAPTCHA Enterprise for abuse-prone endpoints if needed
- Storage: signed URLs with short TTL; validate MIME and size; scan uploads (voice/image) server-side

## Data Protection
- Data minimization and purpose limitation; collect only what’s needed
- Encrypt at rest (Cloud provider default) + client-side E2EE for messages
- Separate sensitive collections; avoid broad read permissions; denormalize minimally
- Regular backups with encryption; test restore procedures

## Development & Supply Chain
- CI: SAST/dep scanning (e.g., Dependabot, OSSReviewToolkit); signed, reproducible builds
- Pin dependency versions; monitor CVEs; apply security patches promptly
- Code reviews with secure coding checklist; prohibit wildcard rule changes without approval

## Incident Response
- Clear runbooks: detection, containment, eradication, recovery, post-mortem
- Contact channels and user notifications for reportable incidents

## Firestore Rule Principles
- Only participants can read conversation docs and messages; messages immutable post-write
- Only owners can update their profiles/listings; restrict fields via Cloud Functions where needed
- Ratings/endorsements: creator writes; read to authenticated users; no edits
- Matches: server-only writes; users read only if involved via listings they own
- Intros: owner-read by default; consented access via signed URLs or approval records

Refer to `server/firestore.rules` and `server/firestore.indexes.json` for concrete policy and indexes.