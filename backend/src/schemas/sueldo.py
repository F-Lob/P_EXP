from pydantic import BaseModel

class SueldoCreate(BaseModel):
    monto: float

class SueldoResponse(BaseModel):
    id: int
    monto: float

    class Config:
        from_attributes = True