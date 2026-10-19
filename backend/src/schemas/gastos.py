from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class GastoCreate(BaseModel):
    descripcion: str = Field(min_length=1, max_length=150)
    monto: float = Field(gt=0)
    categoria_id: int = Field(gt=0)
    fecha: Optional[datetime] = None
    es_fijo: bool = False
    dia_cobro: Optional[int] = Field(default=None, ge=1, le=31)

class GastoResponse(BaseModel):
    id: int
    descripcion: str
    monto: float
    fecha: datetime
    categoria_id: int
    es_fijo: bool
    dia_cobro: Optional[int] = None

    class Config:
        from_attributes = True
