from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Usuario
from ..auth.auth import hashear_password, verificar_password, crear_token
from pydantic import BaseModel

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

class UsuarioCreate(BaseModel):
    username: str
    password: str

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