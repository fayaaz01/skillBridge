## Localization (English/Tamil/Hindi/Arabic)

### Strategy
- i18next in React Native with JSON resource bundles for `en`, `ta`, `hi`, `ar`
- Arabic is RTL: ensure RTL support via React Native I18nManager and layout mirroring
- Tamil/Hindi use LTR; ensure appropriate fonts (system defaults generally OK)
- Notifications localized server-side based on `profiles.preferredLanguages[0]`

### Structure
```
mobile/src/i18n/
  en.json
  ta.json
  hi.json
  ar.json
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

Tamil/Hindi/Arabic translations mirror keys in `ta.json`, `hi.json`, and `ar.json` respectively.

### Runtime Toggle
- Provide Settings toggle with these options: English, Tamil, Hindi, Arabic
- Persist choice in secure storage and Redux Persist; default to device language

