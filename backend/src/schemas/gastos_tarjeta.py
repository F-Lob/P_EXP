from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GastoTarjetaCreate(BaseModel):
    descripcion: str
    monto_total: float
    cuotas_totales: int
    cuotas_pagadas: int = 0
    fecha_inicio: Optional[datetime] = None
    tarjeta_id: int

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