## Offline Sync Strategy

### Goals
- Core flows usable without network: view cached feed, create/edit listings, chat drafts
- Predictable conflict handling and low data loss

### Mechanisms
- Firestore persistence: enable offline cache and write queue
- Redux Persist: store UI state, drafts, and pending actions
- Local encrypted storage for E2EE keys and unsent messages

### Conflict Resolution
- Listings: last-write-wins on primitive fields; append-merge arrays; server timestamp authority
- Messages: messageId is client-generated (ULID); dedupe on id; server enforces RO fields
- Matches: server-authored; client can only change status via RPC to avoid conflicts

### Sync Triggers
- App foreground, network regain, and periodic background task
- Backoff with jitter to conserve battery and respect quotas

### Edge Cases
- Clock skew: rely on server timestamps in writes via Functions when needed
- Large media: queue uploads; thumbnail inline until full upload succeeds

