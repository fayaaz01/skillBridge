from typing import List, Optional, Dict
from pydantic import BaseModel
from sqlmodel import SQLModel, Field as SQLField
from datetime import datetime


# ---------- Pydantic Schemas ----------

class Location(BaseModel):
	lat: float
	lng: float

class AvailabilitySlot(BaseModel):
	day: int
	start: str
	end: str

class Features(BaseModel):
	skills: List[str] = []
	languages: List[str] = []
	location: Optional[Location] = None
	availability: Optional[List[AvailabilitySlot]] = None
	urgency: Optional[int] = 3
	trustScore: Optional[float] = 0.5

class Candidate(BaseModel):
	providerId: str
	providerListingId: str
	features: Features

class ComputeRequest(BaseModel):
	requesterFeatures: Features
	candidatePool: List[Candidate]
	k: int = 10
	context: Optional[Dict] = None

class MatchItem(BaseModel):
	providerId: str
	providerListingId: str
	score: float
	rationale: Optional[str] = None

class ComputeResponse(BaseModel):
	matches: List[MatchItem]

class FeedbackPayload(BaseModel):
	matchId: str
	action: str  # "accept" | "decline" | "chat" | "rate"
	reward: Optional[float] = None
	featureImportances: Optional[Dict[str, float]] = None


# ---------- SQLModel (SQLite memory) ----------

class Feedback(SQLModel, table=True):
	id: Optional[int] = SQLField(default=None, primary_key=True)
	matchId: str
	action: str
	reward: Optional[float] = None
	createdAt: datetime = SQLField(default_factory=datetime.utcnow)

class Weights(SQLModel, table=True):
	name: str = SQLField(primary_key=True)
	skill: float = 0.4
	language: float = 0.15
	location: float = 0.2
	availability: float = 0.1
	trust: float = 0.1
	urgency: float = 0.05
	updatedAt: datetime = SQLField(default_factory=datetime.utcnow)