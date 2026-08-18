from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Gasto, Usuario
from ..schemas.gastos import GastoCreate, GastoResponse
from ..auth.auth import get_usuario_actual
from typing import List
import datetime

router = APIRouter(
    prefix="/gastos",
    tags=["Gastos"]
)

@router.get("/", response_model=List[GastoResponse])
def listar_gastos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    return db.query(Gasto).filter(Gasto.usuario_id == usuario.id).all()

@router.get("/{gasto_id}", response_model=GastoResponse)
def obtener_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.usuario_id == usuario.id
    ).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    return gasto

@router.post("/", response_model=GastoResponse)
def crear_gasto(
    gasto: GastoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    nuevo = Gasto(
        descripcion=gasto.descripcion,
        monto=gasto.monto,
        categoria_id=gasto.categoria_id,
        fecha=gasto.fecha or datetime.datetime.utcnow(),
        usuario_id=usuario.id
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{gasto_id}", response_model=GastoResponse)
def editar_gasto(
    gasto_id: int,
    datos: GastoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.usuario_id == usuario.id
    ).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")

    gasto.descripcion = datos.descripcion
    gasto.monto = datos.monto
    gasto.categoria_id = datos.categoria_id
    if datos.fecha:
        gasto.fecha = datos.fecha

    db.commit()
    db.refresh(gasto)
    return gasto

@router.delete("/{gasto_id}")
def eliminar_gasto(
    gasto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    gasto = db.query(Gasto).filter(
        Gasto.id == gasto_id,
        Gasto.usuario_id == usuario.id
    ).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")

    db.delete(gasto)
    db.commit()
    return {"mensaje": "Gasto eliminado correctamente"}