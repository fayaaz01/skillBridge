## Architecture

### Goals
- Mobile-first, offline-capable, privacy-centric
- Agentic AI suggestions with minimal PII exposure
- Simple ops: managed backend (Firebase) + small Python service

### Components
- Mobile App (React Native, Expo)
  - Screens: Dashboard, Listing, Matches, Chat, Scheduling, Ratings, Settings
  - State: Redux Toolkit with Persist; encrypted storage for keys
  - i18n: i18next with Tamil/English
- Firebase
  - Auth: Email/password + student email domain or document upload
  - Firestore: Listings, Matches, Messages, Ratings, Profiles
  - Cloud Functions (Node.js): student verification, notifications, scheduled jobs
  - Storage: doc uploads (student ID), encrypted blobs if needed
- AI Match Service (Python, FastAPI on Cloud Run)
  - Endpoint: computeMatches, logFeedback
  - Inputs: anonymized skills, categories, hashed location grid, availability, urgency, trust score
  - Outputs: ranked user/listing IDs with relevance and rationale
  - Learning: bandit feedback from accept/decline/rate

### Data Flow
1. User signs in → Firebase Auth issues ID token
2. App reads/writes to Firestore; messages are encrypted client-side
3. Cloud Function verifies student status and sets `profile.verified=true`
4. App requests matches → Cloud Function proxies to AI service with de-identified features
5. AI service returns ranked candidates; app stores suggestions and notifies user

### Encryption Model
- Messaging: E2EE using per-conversation double-ratchet (Signal-protocol-compatible lib) or libsodium sealed boxes
- Keys: per-user identity keypair; per-conversation ephemeral keys stored only on devices
- Storage: ciphertext in `messages` collection; metadata minimized (senderId, convoId, timestamp)

### Offline Strategy
- Firestore local persistence for cache and writes queue
- Redux Persist for UI state and drafts
- Conflict policy: last-write-wins on simple fields; server-side merge for arrays; idempotent upserts

### Observability
- Client: minimal analytics; local-only telemetry by default
- Server: Cloud Logging for Functions and AI service; privacy filters

### Non-Goals (v0)
- Public profile discovery
- Payments or credits
- Web app parity

