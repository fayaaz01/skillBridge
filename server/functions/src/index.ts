import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

admin.initializeApp();
const db = admin.firestore();
const AI_URL = process.env.AI_URL || 'http://localhost:8000';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Auth middleware
app.use(async (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) return next();
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).uid = decoded.uid;
  } catch (_e) {
    // ignore; routes can enforce auth
  }
  next();
});

function requireAuth(req: any, res: any, next: any) {
  if (!req.uid) return res.status(401).json({ error: { code: 'unauthenticated', message: 'Auth required' } });
  next();
}

// Profiles
app.patch('/profiles/me', requireAuth, async (req, res) => {
  const uid = (req as any).uid as string;
  const { shortOfferSummary } = req.body || {};
  if (!shortOfferSummary || String(shortOfferSummary).trim().length < 20) {
    return res.status(400).json({ error: { code: 'invalid-argument', message: 'shortOfferSummary min 20 chars' } });
  }
  await db.collection('profiles').doc(uid).set({ shortOfferSummary, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  res.json({ ok: true });
});

// Listings (create minimal placeholder)
app.post('/listings', requireAuth, async (req, res) => {
  const uid = (req as any).uid as string;
  const { title, description, location } = req.body || {};
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return res.status(400).json({ error: { code: 'invalid-argument', message: 'location {lat,lng} required' } });
  }
  const doc = await db.collection('listings').add({ ownerId: uid, title, description, location, status: 'active', createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  res.json({ id: doc.id });
});

// Ratings (enforce required fields)
app.post('/ratings', requireAuth, async (req, res) => {
  const uid = (req as any).uid as string;
  const { matchId, rateeId, score, tags, comment } = req.body || {};
  if (![1,2,3,4,5].includes(score)) return res.status(400).json({ error: { code: 'invalid-argument', message: 'score 1..5' } });
  if (!Array.isArray(tags) || tags.length < 1) return res.status(400).json({ error: { code: 'invalid-argument', message: 'at least one tag' } });
  if (!comment || String(comment).trim().length < 10) return res.status(400).json({ error: { code: 'invalid-argument', message: 'comment min 10 chars' } });
  await db.collection('ratings').add({ matchId, raterId: uid, rateeId, score, tags, comment, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  res.json({ ok: true });
});

// Location update
app.post('/profile/updateLocation', requireAuth, async (req, res) => {
  const uid = (req as any).uid as string;
  const { lat, lng } = req.body || {};
  if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ error: { code: 'invalid-argument', message: 'lat/lng required' } });
  await db.collection('profiles').doc(uid).set({ location: { lat, lng } , updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  res.json({ ok: true });
});

export const api = functions.region('us-central1').https.onRequest(app);

// -------- AI wiring routes --------
app.post('/matches:compute', requireAuth, async (req, res) => {
  try {
    const resp = await fetch(`${AI_URL}/computeMatches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(data);
    return res.json(data);
  } catch (e: any) {
    return res.status(502).json({ error: { code: 'ai-service-unavailable', message: String(e?.message || e) } });
  }
});

app.post('/ai/feedback', requireAuth, async (req, res) => {
  try {
    const resp = await fetch(`${AI_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(data);
    return res.json(data);
  } catch (e: any) {
    return res.status(502).json({ error: { code: 'ai-service-unavailable', message: String(e?.message || e) } });
  }
});
