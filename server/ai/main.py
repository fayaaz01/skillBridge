from fastapi import FastAPI
from sqlmodel import SQLModel, Session, create_engine
from typing import List
from math import radians, sin, cos, asin, sqrt
from datetime import datetime

from models import ComputeRequest, ComputeResponse, MatchItem, FeedbackPayload, Feedback, Weights

app = FastAPI(title="SkillBridge AI Service", version="0.1.0")
engine = create_engine("sqlite:///ai.db", echo=False)


def init_db():
	SQLModel.metadata.create_all(engine)
	with Session(engine) as session:
		w = session.get(Weights, "default")
		if not w:
			session.add(Weights(name="default"))
			session.commit()


@app.on_event("startup")
async def on_startup():
	init_db()


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
	R = 6371.0
	dlat = radians(lat2 - lat1)
	dlon = radians(lon2 - lon1)
	a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
	c = 2 * asin(sqrt(a))
	return R * c


def jaccard(a: List[str], b: List[str]) -> float:
	set_a, set_b = set([s.lower() for s in a]), set([s.lower() for s in b])
	if not set_a and not set_b:
		return 0.0
	inter = len(set_a & set_b)
	union = len(set_a | set_b)
	return inter / union if union else 0.0


def clamp01(x: float) -> float:
	return max(0.0, min(1.0, x))


def availability_overlap(_req_slots, _cand_slots) -> float:
	if _req_slots and _cand_slots:
		return 0.5
	return 0.0


def load_weights() -> Weights:
	with Session(engine) as session:
		w = session.get(Weights, "default")
		assert w is not None
		return w


@app.post("/computeMatches", response_model=ComputeResponse)
async def compute_matches(body: ComputeRequest):
	w = load_weights()
	req = body.requesterFeatures
	matches: List[MatchItem] = []
	for c in body.candidatePool:
		cf = c.features
		skill_s = jaccard(req.skills or [], cf.skills or [])
		lang_s = jaccard(req.languages or [], cf.languages or [])
		loc_s = 0.0
		if req.location and cf.location:
			d = haversine_km(req.location.lat, req.location.lng, cf.location.lat, cf.location.lng)
			loc_s = clamp01(max(0.0, 1.0 - d / 20.0))
		avail_s = availability_overlap(req.availability, cf.availability)
		trust_s = clamp01((cf.trustScore or 0.0))
		urgency_s = 1.0 - (((cf.urgency or 3) - (req.urgency or 3)) ** 2) / 16.0
		urgency_s = clamp01(urgency_s)

		score = (
			w.skill * skill_s +
			w.language * lang_s +
			w.location * loc_s +
			w.availability * avail_s +
			w.trust * trust_s +
			w.urgency * urgency_s
		)
		rationale = f"skills {skill_s:.2f}, languages {lang_s:.2f}, near {loc_s:.2f}"
		matches.append(MatchItem(providerId=c.providerId, providerListingId=c.providerListingId, score=round(float(score), 4), rationale=rationale))

	matches.sort(key=lambda m: m.score, reverse=True)
	return ComputeResponse(matches=matches[: body.k])


@app.post("/feedback")
async def feedback(body: FeedbackPayload):
	with Session(engine) as session:
		session.add(Feedback(matchId=body.matchId, action=body.action, reward=body.reward))
		session.commit()
		if body.reward is not None and body.featureImportances:
			w = session.get(Weights, "default")
			if w:
				delta = 0.01 * float(body.reward)
				for key, val in body.featureImportances.items():
					if hasattr(w, key):
						setattr(w, key, getattr(w, key) + delta * float(val))
				total = w.skill + w.language + w.location + w.availability + w.trust + w.urgency
				if total > 0:
					w.skill /= total; w.language /= total; w.location /= total; w.availability /= total; w.trust /= total; w.urgency /= total
				w.updatedAt = datetime.utcnow()
				session.add(w)
				session.commit()
	return {"ok": True}