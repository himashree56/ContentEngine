"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional


class CampaignRequest(BaseModel):
    user_brief: str
    text_model: Optional[str] = None  # Override default model from .env


class TaskStatusResponse(BaseModel):
    status: str
    step: Optional[str] = None
    data: Optional[dict] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str


class GenerateResponse(BaseModel):
    task_id: str
    status: str
