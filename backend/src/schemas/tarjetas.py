from pydantic import BaseModel

class TarjetaCreate(BaseModel):
    nombre: str

class TarjetaResponse(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True