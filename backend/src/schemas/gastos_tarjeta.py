from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class GastoTarjetaCreate(BaseModel):
    descripcion: str = Field(min_length=1, max_length=150)
    monto_total: float = Field(gt=0)
    cuotas_totales: int = Field(gt=0, le=360)
    cuotas_pagadas: int = Field(default=0, ge=0)
    fecha_inicio: Optional[datetime] = None
    tarjeta_id: int = Field(gt=0)

class GastoTarjetaResponse(BaseModel):
    id: int
    descripcion: str
    monto_total: float
    cuotas_totales: int
    cuotas_pagadas: int
    fecha_inicio: datetime
    tarjeta_id: int

    # Campos calculados
    monto_por_cuota: float = 0
    cuotas_restantes: int = 0

    class Config:
        from_attributes = True
