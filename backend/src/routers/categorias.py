from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Categoria
from ..schemas.categorias import CategoriaCreate, CategoriaResponse
from typing import List

router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)

# Listar todas las categorías
@router.get("/", response_model=List[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()

# Crear una nueva categoría
@router.post("/", response_model=CategoriaResponse)
def crear_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe
    existe = db.query(Categoria).filter(Categoria.nombre == categoria.nombre).first()
    if existe:
        raise HTTPException(status_code=400, detail="La categoría ya existe")
    
    nueva = Categoria(nombre=categoria.nombre)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

# Eliminar una categoría por ID
@router.delete("/{categoria_id}")
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    db.delete(categoria)
    db.commit()
    return {"mensaje": "Categoría eliminada correctamente"}