from pydantic import BaseModel, Field

class SueldoCreate(BaseModel):
    monto: float = Field(gt=0)

class SueldoResponse(BaseModel):
    id: int
    monto: float

    class Config:
        from_attributes = True
