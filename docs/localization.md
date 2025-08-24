## Localization (Tamil/English)

### Strategy
- i18next in React Native with JSON resource bundles for `en` and `ta`
- RTL not required for Tamil, but ensure font support
- Notifications localized server-side based on `profiles.preferredLanguages[0]`

### Structure
```
mobile/src/i18n/
  en.json
  ta.json
  index.ts
```

### Example Keys
```
{
  "app.title": "Skill Exchange",
  "auth.login": "Log in",
  "auth.verify": "Verify student status",
  "listing.new": "New Listing",
  "listing.offer": "Offer",
  "listing.request": "Request",
  "chat.send": "Send",
  "rating.leave": "Leave a rating"
}
```

Tamil translations mirror keys in `ta.json`.

