from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MetaCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    monto_objetivo: float = Field(gt=0)
    fecha_objetivo: Optional[datetime] = None


class AporteMeta(BaseModel):
    monto: float = Field(gt=0)


class MetaResponse(BaseModel):
    id: int
    nombre: str
    monto_objetivo: float
    monto_ahorrado: float
    fecha_objetivo: Optional[datetime] = None

    class Config:
        from_attributes = True
