from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Categoria, Gasto, Sueldo, Usuario
from ..database.default_categories import ensure_default_categories
from ..auth.auth import hashear_password, verificar_password, crear_token, get_usuario_actual
from pydantic import BaseModel, Field
from typing import Optional, List
import datetime

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

class UsuarioCreate(BaseModel):
    username: str
    password: str


class GastoFijoInicial(BaseModel):
    descripcion: str = Field(min_length=1, max_length=150)
    monto: float = Field(gt=0)
    categoria_id: int = Field(gt=0)
    dia_cobro: int = Field(ge=1, le=31)


class MetaInicial(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    monto_objetivo: float = Field(gt=0)


class OnboardingCreate(BaseModel):
    sueldo: float = Field(gt=0)
    dia_pago: int = Field(ge=1, le=31)
    gastos_fijos: List[GastoFijoInicial] = []
    meta: Optional[MetaInicial] = None

# Registro
@router.post("/registro")
def registro(datos: UsuarioCreate, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.username == datos.username).first()
    if existe:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    nuevo = Usuario(
        username=datos.username,
        password=hashear_password(datos.password)
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    ensure_default_categories(db, nuevo.id)
    return {"mensaje": "Usuario creado correctamente"}

# Login
@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.username == form.username).first()
    if not usuario or not verificar_password(form.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    token = crear_token({"sub": usuario.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/perfil")
def obtener_perfil(usuario: Usuario = Depends(get_usuario_actual)):
    return {
        "onboarding_completado": usuario.onboarding_completado,
        "dia_pago": usuario.dia_pago,
    }


@router.post("/onboarding")
def completar_onboarding(
    datos: OnboardingCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    from ..database.models import MetaAhorro

    ensure_default_categories(db, usuario.id)
    categoria_ids = {categoria.id for categoria in db.query(Categoria).filter(Categoria.usuario_id == usuario.id).all()}
    if any(gasto.categoria_id not in categoria_ids for gasto in datos.gastos_fijos):
        raise HTTPException(status_code=400, detail="Selecciona categorías válidas para los gastos fijos")

    sueldo = db.query(Sueldo).filter(Sueldo.usuario_id == usuario.id).first()
    if sueldo:
        sueldo.monto = datos.sueldo
    else:
        db.add(Sueldo(monto=datos.sueldo, usuario_id=usuario.id))

    for gasto in datos.gastos_fijos:
        db.add(Gasto(
            descripcion=gasto.descripcion,
            monto=gasto.monto,
            categoria_id=gasto.categoria_id,
            es_fijo=True,
            dia_cobro=gasto.dia_cobro,
            fecha=datetime.datetime.utcnow(),
            usuario_id=usuario.id,
        ))

    if datos.meta:
        db.add(MetaAhorro(
            nombre=datos.meta.nombre,
            monto_objetivo=datos.meta.monto_objetivo,
            monto_ahorrado=0,
            usuario_id=usuario.id,
        ))

    usuario.dia_pago = datos.dia_pago
    usuario.onboarding_completado = True
    db.commit()
    return {"mensaje": "Configuración inicial guardada"}
