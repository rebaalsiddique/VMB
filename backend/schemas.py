from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class ScenarioBase(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "draft"
    params: Dict[str, Any]
    results: Optional[Dict[str, Any]] = None

class ScenarioCreate(ScenarioBase):
    id: str

class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    params: Optional[Dict[str, Any]] = None
    results: Optional[Dict[str, Any]] = None

class ScenarioResponse(ScenarioBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
