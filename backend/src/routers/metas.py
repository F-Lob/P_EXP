from typing import List
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth.auth import get_usuario_actual
from ..database.database import get_db
from ..database.models import MetaAhorro, Usuario
from ..schemas.metas import AporteMeta, MetaCreate, MetaResponse


router = APIRouter(prefix="/metas", tags=["Metas de ahorro"])


@router.get("/", response_model=List[MetaResponse])
def listar_metas(db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_actual)):
    return db.query(MetaAhorro).filter(MetaAhorro.usuario_id == usuario.id).order_by(MetaAhorro.id.desc()).all()


@router.post("/", response_model=MetaResponse)
def crear_meta(datos: MetaCreate, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_actual)):
    meta = MetaAhorro(**datos.dict(), usuario_id=usuario.id)
    db.add(meta)
    db.commit()
    db.refresh(meta)
    return meta


@router.patch("/{meta_id}/aportar", response_model=MetaResponse)
def aportar_meta(meta_id: int, datos: AporteMeta, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_actual)):
    meta = db.query(MetaAhorro).filter(MetaAhorro.id == meta_id, MetaAhorro.usuario_id == usuario.id).first()
    if not meta:
        raise HTTPException(status_code=404, detail="Meta no encontrada")
    aporte = Decimal(str(datos.monto))
    meta.monto_ahorrado = min(meta.monto_objetivo, meta.monto_ahorrado + aporte)
    db.commit()
    db.refresh(meta)
    return meta


@router.delete("/{meta_id}")
def eliminar_meta(meta_id: int, db: Session = Depends(get_db), usuario: Usuario = Depends(get_usuario_actual)):
    meta = db.query(MetaAhorro).filter(MetaAhorro.id == meta_id, MetaAhorro.usuario_id == usuario.id).first()
    if not meta:
        raise HTTPException(status_code=404, detail="Meta no encontrada")
    db.delete(meta)
    db.commit()
    return {"mensaje": "Meta eliminada"}
