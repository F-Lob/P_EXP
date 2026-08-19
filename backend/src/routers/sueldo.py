from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Sueldo, Usuario
from ..schemas.sueldo import SueldoCreate, SueldoResponse
from ..auth.auth import get_usuario_actual

router = APIRouter(
    prefix="/sueldo",
    tags=["Sueldo"]
)

@router.get("/", response_model=SueldoResponse)
def obtener_sueldo(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    sueldo = db.query(Sueldo).filter(Sueldo.usuario_id == usuario.id).first()
    if not sueldo:
        raise HTTPException(status_code=404, detail="Sueldo no registrado")
    return sueldo

@router.post("/", response_model=SueldoResponse)
def crear_o_actualizar_sueldo(
    datos: SueldoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    sueldo = db.query(Sueldo).filter(Sueldo.usuario_id == usuario.id).first()

    if sueldo:
        sueldo.monto = datos.monto
        db.commit()
        db.refresh(sueldo)
        return sueldo

    nuevo = Sueldo(monto=datos.monto, usuario_id=usuario.id)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo