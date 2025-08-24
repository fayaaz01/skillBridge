## Student Skill Exchange Platform (Mobile-first)

A privacy-first, agentic AI platform enabling university students to exchange academic, creative, and personal support services via a structured, trust-based barter system (no money). Designed for offline-first use, local relevance, and end-to-end encrypted messaging.

### Core Features
- User authentication with student verification and optional 2FA
- Skill offers/requests with availability, language, and urgency
- AI matchmaking engine with agentic proactive suggestions
- Secure in-app chat, scheduling, and calendar integration
- Trust and reputation with ratings and badges
- Offline sync for posting, browsing, and messaging
- Multilingual UI (English/Tamil/Hindi/Arabic)
- Privacy-first defaults and data deletion controls

### Suggested Tech Stack
- Frontend: React Native (Expo), Redux Toolkit, Redux Persist, i18next
- Backend: Firebase Auth, Firestore, Cloud Functions (Node.js)
- AI Matching: Python (FastAPI service) + scikit-learn or TensorFlow, optionally TF Lite on-device
- Messaging: Firestore collections with client-side E2EE
- Location: Google Maps SDK
- Calendar: Platform Calendar APIs (iOS/Android) or Google Calendar API

### High-Level Architecture
- Mobile app communicates with Firebase (Auth + Firestore). Firestore provides offline cache and sync.
- Sensitive message content is encrypted on-device before writes; server stores only ciphertext/metadata.
- Cloud Functions handle verification, notifications, and integration glue.
- A Python microservice (Cloud Run) computes matches and agentic suggestions, reading minimal anonymized features.

### Repository Structure
```
docs/                    # Architecture, data models, specs, privacy, etc.
mobile/                  # React Native (Expo) app
server/                  # Cloud Functions (Node.js) + AI match service (Python)
```

### Getting Started (Dev)
1) Mobile (Expo)
   - Install Node 18+, pnpm or yarn, and expo-cli
   - Copy .env.example to .env and fill Firebase keys
   - pnpm install && pnpm expo start

2) Server (Firebase + Python)
   - Install Firebase CLI and Python 3.11
   - cd server/functions && npm i; cd ..
   - For AI service: cd server/ai && create venv; pip install -r requirements.txt
   - firebase emulators:start

### Security & Privacy
- Zero-knowledge E2EE chat: plaintext never leaves devices
- Minimal data collection; no public user directory
- Optional trust signals (peer endorsements, video/voice intros, reliability metrics);
  pseudonymous display in-app by default

### Roadmap
- v0: Auth + Listings + Basic matching + E2EE chat + Offline
- v1: Agentic suggestions + Scheduling + Calendar integration
- v2: On-device ML personalization + Badge automation

# skillBridge
A peer-to-peer student skill exchange platform that is based on barter system and not money. It is designed for affordability, collaboration, and real-world learning.
