from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import Categoria, Usuario
from ..schemas.categorias import CategoriaCreate, CategoriaResponse, PresupuestoCategoria
from ..auth.auth import get_usuario_actual
from ..database.default_categories import ensure_default_categories
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
    return ensure_default_categories(db, usuario.id)

@router.post("/", response_model=CategoriaResponse)
def crear_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    raise HTTPException(status_code=403, detail="Las categorías son fijas y no se pueden crear")

@router.delete("/{categoria_id}")
def eliminar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    raise HTTPException(status_code=403, detail="Las categorías fijas no se pueden eliminar")


@router.put("/{categoria_id}/presupuesto", response_model=CategoriaResponse)
def actualizar_presupuesto(
    categoria_id: int,
    datos: PresupuestoCategoria,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    categoria = db.query(Categoria).filter(
        Categoria.id == categoria_id,
        Categoria.usuario_id == usuario.id
    ).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    categoria.presupuesto_mensual = datos.monto
    db.commit()
    db.refresh(categoria)
    return categoria
