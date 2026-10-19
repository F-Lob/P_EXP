from typing import Optional

from pydantic import BaseModel, Field

class CategoriaCreate(BaseModel):
    nombre: str

class CategoriaResponse(BaseModel):
    id: int
    nombre: str
    presupuesto_mensual: Optional[float] = None

    class Config:
        from_attributes = True


class PresupuestoCategoria(BaseModel):
    monto: Optional[float] = Field(default=None, gt=0)
