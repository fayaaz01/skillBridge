#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID=${1:-skillbridge-f1b43}

echo "[1/3] Build Expo web"
cd /workspace/mobile
npm install
npx expo export --platform web --output-dir dist

echo "[2/3] Point Firebase Hosting to web build"
cd /workspace
if [ -f firebase.json ]; then
  node - <<'NODE'
const fs=require('fs');
const path='firebase.json';
const j=JSON.parse(fs.readFileSync(path,'utf8'));
j.hosting=j.hosting||{};
j.hosting.public='mobile/dist';
fs.writeFileSync(path, JSON.stringify(j,null,2));
console.log('firebase.json updated: hosting.public = mobile/dist');
NODE
fi

echo "[3/3] Deploy to Firebase Hosting ($PROJECT_ID)"
firebase login || true
firebase use "$PROJECT_ID"
firebase deploy --only hosting
echo "Deployed. Link: https://$PROJECT_ID.web.app"
