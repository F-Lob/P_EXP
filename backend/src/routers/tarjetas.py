from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Tarjeta, Usuario
from ..schemas.tarjetas import TarjetaCreate, TarjetaResponse
from ..auth.auth import get_usuario_actual
from typing import List

router = APIRouter(
    prefix="/tarjetas",
    tags=["Tarjetas"]
)

@router.get("/", response_model=List[TarjetaResponse])
def listar_tarjetas(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    return db.query(Tarjeta).filter(Tarjeta.usuario_id == usuario.id).all()

@router.post("/", response_model=TarjetaResponse)
def crear_tarjeta(
    tarjeta: TarjetaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    existe = db.query(Tarjeta).filter(
        Tarjeta.nombre == tarjeta.nombre,
        Tarjeta.usuario_id == usuario.id
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe una tarjeta con ese nombre")

    nueva = Tarjeta(nombre=tarjeta.nombre, usuario_id=usuario.id)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.delete("/{tarjeta_id}")
def eliminar_tarjeta(
    tarjeta_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    tarjeta = db.query(Tarjeta).filter(
        Tarjeta.id == tarjeta_id,
        Tarjeta.usuario_id == usuario.id
    ).first()
    if not tarjeta:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")

    db.delete(tarjeta)
    db.commit()
    return {"mensaje": "Tarjeta eliminada correctamente"}