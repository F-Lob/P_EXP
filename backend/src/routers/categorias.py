from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Categoria, Usuario
from ..schemas.categorias import CategoriaCreate, CategoriaResponse
from ..auth.auth import get_usuario_actual
from typing import List

router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)

@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    return db.query(Categoria).filter(Categoria.usuario_id == usuario.id).all()

@router.post("/", response_model=CategoriaResponse)
def crear_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    existe = db.query(Categoria).filter(
        Categoria.nombre == categoria.nombre,
        Categoria.usuario_id == usuario.id
    ).first()
    if existe:
        raise HTTPException(status_code=400, detail="La categoría ya existe")

    nueva = Categoria(nombre=categoria.nombre, usuario_id=usuario.id)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.delete("/{categoria_id}")
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    categoria = db.query(Categoria).filter(
        Categoria.id == categoria_id,
        Categoria.usuario_id == usuario.id
    ).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    db.delete(categoria)
    db.commit()
    return {"mensaje": "Categoría eliminada correctamente"}