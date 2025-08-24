## API Contracts and Services

Transport: HTTPS + Firebase Auth bearer ID token. Where possible, Cloud Functions callable or HTTPS endpoints; AI service behind a proxy Function.

### Auth and Verification (Cloud Functions)
- POST `/verify/start` → { method: "email" | "document" }
  - Starts domain check or returns signed URL for upload
- POST `/verify/complete` → { status }
- GET `/verify/status` → { status, note }

### Listings
- POST `/listings` → create listing
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
- POST `/conversations` → { participantId, listingIds?, e2ee.protocol } → { convoId }
- GET `/conversations?me=1&orderBy=lastMessageAt desc`
- POST `/conversations/{id}/messages` → ciphertext payload; server writes RO fields
- POST `/conversations/{id}:read-receipts` → { messageIds }

### Ratings & Trust
- POST `/ratings` → create rating; triggers trust update
- GET `/profiles/{id}/trust` → limited public trust summary

### Scheduling
- POST `/events` → propose
- PATCH `/events/{id}` → confirm/cancel
- GET `/events?convoId=...`

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

