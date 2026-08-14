from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GastoCreate(BaseModel):
    descripcion: str
    monto: float
    categoria_id: int
    fecha: Optional[datetime] = None 

class GastoResponse(BaseModel):
    id: int
    descripcion: str
    monto: float
    fecha: datetime
    categoria_id: int

    class Config:
        from_attributes = True