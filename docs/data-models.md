## Firestore Data Models

Notation: `?` optional, `[]` array, `RO` read-only (server-set).

### Collections Overview
- `profiles/{userId}`: user profile and trust metadata
- `listings/{listingId}`: skill offers or requests
- `conversations/{convoId}`: chat conversations
- `conversations/{convoId}/messages/{messageId}`: encrypted messages
- `matches/{matchId}`: match suggestions and status
- `ratings/{ratingId}`: post-exchange feedback
- `endorsements/{endorsementId}`: peer endorsements
- `intros/{introId}`: user video/voice introductions
 - `introRequests/{requestId}`: consent workflow for viewing intro
- `events/{eventId}`: scheduled sessions
- `profiles/{userId}/keys`: Signal prekey bundle (public)

### profiles
```
profiles: {
  userId: string (RO),
  displayName: string,
  avatarUrl?: string,
  preferredLanguages: string[]  // e.g., ["en", "ta"]
  campus?: string,              // e.g., uni short code
  location: {                   // precise GPS, required on onboarding
    lat: number,
    lng: number,
    geohash?: string
  },
  bio?: string,
  createdAt: Timestamp (RO),
  updatedAt: Timestamp (RO),
  trust: {
    score: number,              // 0..100
    badges: string[],           // e.g., ["reliable", "helper"]
    completedExchanges: number,
    cancellationRate: number,   // 0..1
    responseTimeMsAvg?: number,
    onTimeRate?: number         // 0..1
  },
  privacy: {
    showAvatar: boolean,
    showCampus: boolean,
    showRealName: boolean,        // default false
    showRealPhoto: boolean,       // default false
    searchable: false           // always false by design
  },
  intro?: {                     // optional intro media summary
    hasIntro: boolean,
    type?: "video" | "audio",
    mediaRef?: string,
    durationSec?: number
  }
}
```

### listings
```
listings: {
  listingId: string (RO),
  ownerId: string,
  type: "offer" | "request",
  category: "academic" | "creative" | "personal",
  title: string,
  description: string,
  skills: string[],             // normalized keywords
  preferredLanguages: string[],
  availability: {               // simple window; advanced via events
    timezone: string,
    slots: Array<{ day: number, start: string, end: string }>
  },
  urgency: 1 | 2 | 3 | 4 | 5,
  location: { lat: number, lng: number, geohash?: string },
  status: "active" | "paused" | "archived",
  createdAt: Timestamp (RO),
  updatedAt: Timestamp (RO)
}
```

### matches
```
matches: {
  matchId: string (RO),
  seekerListingId: string,      // request side
  providerListingId: string,    // offer side
  score: number,                // 0..1 model score
  rationale?: string,           // short explanation
  agenticSuggested: boolean,
  status: "suggested" | "accepted" | "declined" | "expired",
  createdAt: Timestamp (RO),
  updatedAt: Timestamp (RO)
}
```

### conversations
```
conversations: {
  convoId: string (RO),
  participantIds: string[2],
  listingIds?: string[],        // related listings
  lastMessageAt: Timestamp (RO),
  createdAt: Timestamp (RO),
  e2ee: {                       // public metadata only
    protocol: "signal",
    version: number,
    safetyNumber?: string       // optional fingerprint for user verification UI
  }
}
```

### messages (E2EE ciphertext)
```
conversations/{convoId}/messages: {
  messageId: string (RO),
  senderId: string,
  sentAt: Timestamp (RO),
  type: "text" | "voice" | "image",
  ciphertext: string,           // base64
  nonce?: string,
  mediaRef?: string,            // Storage path if voice/image
  delivery: {
    deliveredAt?: Timestamp,
    readAt?: Timestamp
  }
}
```

### keys (Signal prekey bundle)
```
profiles/{userId}/keys: {
  identityKeyPub: string,          // base64
  signedPreKeyPub: string,
  signedPreKeySig: string,         // signature by identity key
  oneTimePreKeys: string[],        // rotating pool
  lastRotatedAt: Timestamp (RO),
  version: number
}
```

### ratings (mandatory)
```
ratings: {
  ratingId: string (RO),
  raterId: string,
  rateeId: string,
  matchId: string,
  score: 1 | 2 | 3 | 4 | 5,      // required
  tags: string[],                 // required; must contain >=1
  comment: string,                // required; min length 10
  createdAt: Timestamp (RO)
}
```

### endorsements
```
endorsements: {
  endorsementId: string (RO),
  endorserId: string,
  endorseeId: string,
  text?: string,
  tags?: string[],               // e.g., ["patient", "clear"]
  fromMatchId?: string,
  createdAt: Timestamp (RO)
}
```

### intros
```
intros: {
  introId: string (RO),
  userId: string,
  type: "video" | "audio",
  mediaRef: string,              // Firebase Storage path
  durationSec?: number,
  createdAt: Timestamp (RO),
  visibility: "matches" | "private"
}
```

### introRequests
```
introRequests: {
  requestId: string (RO),
  requesterId: string,
  targetUserId: string,
  type: "video" | "audio",
  status: "pending" | "approved" | "declined" | "expired",
  createdAt: Timestamp (RO),
  actedAt?: Timestamp
}
```

### events (Scheduling)
```
events: {
  eventId: string (RO),
  convoId: string,
  hostId: string,
  participantId: string,
  startsAt: Timestamp,
  endsAt: Timestamp,
  timezone: string,
  createdAt: Timestamp (RO),
  updatedAt: Timestamp (RO),
  status: "proposed" | "confirmed" | "cancelled"
}
```

## Security Rules (Outline)
- Users can read/write their own profile; limited read of others' public fields
- Listings readable to authenticated users; writes restricted to owner
- Conversations readable only to participants; messages encrypted
- Matches readable to involved users; created by server/AI
- Ratings: rater can write, ratee cannot modify; aggregate trust updated via Function
- Endorsements: endorser can create; endorsee can view; others limited
- Intros: owner can read/write; readable to matched users if `visibility == "matches"`
 - IntroRequests: readable by requester and target only
- Keys: `profiles/{userId}/keys` readable to authenticated users; writeable only by owner (and rotation function)

## Indexing Suggestions
- `listings`: composite on `(category, status, urgency desc, createdAt desc)`
- `matches`: `(seekerListingId, status)` and `(providerListingId, status)`
- `conversations`: `(participantIds array-contains, lastMessageAt desc)`

