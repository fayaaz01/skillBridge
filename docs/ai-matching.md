## AI Matchmaking Engine

### Goals
- High-quality, fair, privacy-preserving matches
- Agentic: proactively suggest timely connections
- Learn from feedback over time

### Features and Signals
- Skill compatibility: overlap between request.skills and offer.skills (TF-IDF or embeddings)
- Category/type match, language intersection
- Location proximity via hashed grid distance
- Availability overlap score
- Urgency balancing and trust score priors

### Architecture
- Feature Extractor (Cloud Function): builds anonymized feature vectors
- Ranker (Python):
  - v0: Gradient-boosted trees or logistic regression over engineered signals
  - v1: Dual-encoder embeddings for skills + MLP
  - Re-ranker applies diversity and fairness constraints
- Bandit Feedback: contextual bandit (LinUCB/Thompson) on top of base ranker

### Feedback Loop
- Events: `suggested`, `view`, `chat_started`, `accepted`, `declined`, `rated(score)`
- Rewards: +1 accepted, +0.2 chat, -0.5 declined, +rating-avg offset
- Store feedback keyed by `matchId`; update model periodically

### Agentic Suggestions
- Triggers:
  - New listing created
  - Seeker urgency high and no accepted match within 24h
  - Provider idle for 7 days with high trust score
- Notification with rationale: e.g., "Tamil + Academic Math overlap, available tonight"

### Privacy
- Replace raw location with geocell index and distance bucket
- Hash user/listing IDs when sending to AI service
- Cap rationale text to generic categories

