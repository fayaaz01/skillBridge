## Trust & Reputation

### Principles
- Encourage reliability and positive behavior without enabling harassment or bias
- Private-by-default: expose only coarse trust summaries
- Robust against gaming and collusion

### Inputs to Trust Score (0..100)
- Completion rate (weight 0.35)
- Recent rating average (decayed, weight 0.30)
- Cancellation rate inverse (weight 0.15)
- On-time message responsiveness (weight 0.10)
- Verified status and tenure (weight 0.10)

Score computed as weighted sum, with exponential decay on events older than 90 days.

### Badges
- Reliable: 10+ completed exchanges, cancellationRate < 5%
- Helpful: avgRating >= 4.7 over last 10 ratings
- Consistent: 4+ months tenure, monthly activity maintained
- Multilingual: provides in >=2 languages

### Flow
1. After `ratings` write, Cloud Function updates `profiles.trust`
2. Detect anomalies: bursts from same IP/device; reciprocal rating loops; apply dampening
3. Suspicious activity triggers manual review flag

### Visibility Rules
- Only show: trust score band (Low/Med/High), count of completed exchanges, top 2 badges
- Hide raw comments by default; reveal only to counterparties in a match

