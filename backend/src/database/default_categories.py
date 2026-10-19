from sqlalchemy.orm import Session

from .models import Categoria


DEFAULT_CATEGORIES = (
    "Alimentación",
    "Transporte",
    "Vivienda",
    "Salud",
    "Educación",
    "Entretenimiento",
    "Ahorro",
    "Otros",
)


def ensure_default_categories(db: Session, usuario_id: int) -> list[Categoria]:
    """Creates the fixed categories once for a user and returns them in UI order."""
    categories = db.query(Categoria).filter(Categoria.usuario_id == usuario_id).all()
    by_name = {category.nombre: category for category in categories}
    missing = [
        Categoria(nombre=name, usuario_id=usuario_id)
        for name in DEFAULT_CATEGORIES
        if name not in by_name
    ]

    if missing:
        db.add_all(missing)
        db.commit()
        categories = db.query(Categoria).filter(Categoria.usuario_id == usuario_id).all()
        by_name = {category.nombre: category for category in categories}

    return [by_name[name] for name in DEFAULT_CATEGORIES]
