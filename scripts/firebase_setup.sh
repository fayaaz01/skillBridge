#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID=${1:-skillbridge-exchange-01}
DISPLAY_NAME=${2:-"SkillBridge"}

echo "Project: $PROJECT_ID"
echo "[1/3] Ensuring firebase CLI is logged in and project exists"
firebase login || true
firebase projects:create "$PROJECT_ID" --display-name "$DISPLAY_NAME" || true
firebase use "$PROJECT_ID"

echo "[2/3] Configure Hosting fallback"
mkdir -p hosting
if [ ! -f hosting/index.html ]; then
  cat > hosting/index.html <<'HTML'
<!doctype html>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SkillBridge</title>
<link rel="icon" href="data:," />
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu;max-width:720px;margin:40px auto;padding:0 16px;color:#0b0f14;background:#f6f8fa}</style>
<h1>SkillBridge</h1>
<p>Your app landing page. This is the desktop fallback for your smart link.</p>
HTML
fi

if [ -f firebase.json ]; then
  echo "Merging hosting rewrites into firebase.json"
  node - <<'NODE'
const fs=require('fs');
const path='firebase.json';
const j=JSON.parse(fs.readFileSync(path,'utf8'));
j.hosting=j.hosting||{};
j.hosting.public='hosting';
j.hosting.rewrites=j.hosting.rewrites||[];
const exists=j.hosting.rewrites.some(r=>r.function==='api');
if(!exists) j.hosting.rewrites.push({source:'/api/**', function:'api'});
fs.writeFileSync(path, JSON.stringify(j,null,2));
console.log('Updated firebase.json');
NODE
fi

echo "Deploying Hosting"
firebase deploy --only hosting

echo "[3/3] Dynamic Links: please open console to enable domain"
echo "Open: https://console.firebase.google.com/project/$PROJECT_ID/durablelinks/links"
echo "Then choose default domain ($PROJECT_ID.page.link) and create a link to https://$PROJECT_ID.web.app/app"
echo "Example link: https://$PROJECT_ID.page.link/app"
echo "Done."
