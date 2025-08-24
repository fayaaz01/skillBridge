## API Contracts and Services

Transport: HTTPS + Firebase Auth bearer ID token. Where possible, Cloud Functions callable or HTTPS endpoints; AI service behind a proxy Function.

### Trust Signals (Cloud Functions)
- POST `/endorsements` → { endorseeId, text?, tags? } → create endorsement
- GET `/profiles/{id}/endorsements` → list endorsements for a user (paginated)
- POST `/intros:startUpload` → { type } → { uploadUrl, storagePath }
- POST `/intros:confirm` → { storagePath, durationSec } → register intro

### Listings
- POST `/listings` → create listing (requires location {lat,lng})
- PATCH `/listings/{id}` → update
- GET `/listings` → query with filters: `category`, `type`, `language`, `urgency>=`, `near=grid`
- GET `/listings/{id}` → fetch
- POST `/listings/{id}:archive` → archive

### Matches
- POST `/matches:compute` → { listingId } → returns ranked candidates (synchronous small) and enqueues async refresh
- GET `/matches?listingId=...&status=suggested` → paginated suggestions
- POST `/matches/{id}:accept`
- POST `/matches/{id}:decline`

### Conversations & Messages
### Location
- POST `/profile/updateLocation` → { lat, lng } → updates precise GPS for matching
- POST `/conversations` → { participantId, listingIds? } → { convoId }  // protocol defaults to Signal
- GET `/conversations?me=1&orderBy=lastMessageAt desc`
- POST `/conversations/{id}/messages` → ciphertext payload; server writes RO fields
- POST `/conversations/{id}:read-receipts` → { messageIds }

### Media Uploads (Chat Attachments & Intros)
- POST `/media:startUpload` → { purpose: "chat"|"intro", mimeType } → { uploadUrl, storagePath }
- POST `/media:confirm` → { storagePath, durationSec? } → finalize; returns mediaRef

### Intro Requests (Consent Flow)
- POST `/intros/request` → { targetUserId, type: "video"|"audio" }
- POST `/intros/{requestId}:approve`
- POST `/intros/{requestId}:decline`
- GET `/intros/requests?me=1&status=pending` → list incoming/outgoing

### E2EE Keys (Signal)
- POST `/e2ee/registerBundle` → { identityKeyPub, signedPreKeyPub, signedPreKeySig, oneTimePreKeys[] }
- POST `/e2ee/rotatePrekeys` → { signedPreKeyPub, signedPreKeySig, oneTimePreKeys[] }
- GET `/e2ee/getBundle?userId=...` → returns current public bundle for initiating sessions

### Ratings & Trust
- POST `/ratings` → create rating; triggers trust update
  - Body: { matchId, rateeId, score (1..5), tags: string[], comment: string }
  - Validation: tags.length >= 1, comment.length >= 10
- GET `/profiles/{id}/trust` → limited public trust summary

### Scheduling
- POST `/events` → propose
- PATCH `/events/{id}` → confirm/cancel
- GET `/events?convoId=...`

### Calendar Integrations
- Device calendar: handled client-side via Expo Calendar APIs (no server endpoints)
- Google Calendar (OAuth):
  - POST `/calendar/google/connect` → initiates OAuth; returns URL
  - GET `/calendar/google/callback` → exchanges code for tokens (server-side)
  - POST `/calendar/google/disconnect` → revokes tokens
  - POST `/calendar/google/syncEvent` → { eventId } mirrors event to Google Calendar

### AI Match Service (Python, private)
- POST `/computeMatches`
  - Input: { requesterFeatures, candidatePool[], k, context }
  - Output: { matches: [ { providerId, providerListingId, score, rationale } ] }
- POST `/feedback`
  - Input: { matchId, action: "accept"|"decline"|"chat"|"rate", reward? }

### Error Model
```
{
  error: {
    code: string,           // e.g., "permission-denied"
    message: string,
    details?: object
  }
}
```

