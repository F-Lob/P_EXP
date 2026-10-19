import os

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("SECRET_KEY", "test-secret-key")

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.database.database import Base
from src.database.default_categories import ensure_default_categories
from src.database.models import Usuario
from src.routers.gastos import crear_gasto
from src.schemas.gastos import GastoCreate


@pytest.fixture()
def db():
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    try:
        yield session
    finally:
        session.close()


def test_crear_gasto_guarda_tipo_fijo_y_dia_de_cobro(db):
    usuario = Usuario(username="ana", password="hash")
    db.add(usuario)
    db.commit()
    categorias = ensure_default_categories(db, usuario.id)

    gasto = crear_gasto(
        GastoCreate(descripcion="Arriendo", monto=500000, categoria_id=categorias[2].id, es_fijo=True, dia_cobro=5),
        db,
        usuario,
    )

    assert gasto.es_fijo is True
    assert gasto.dia_cobro == 5


def test_no_permite_usar_categoria_de_otro_usuario(db):
    usuario = Usuario(username="ana", password="hash")
    otro_usuario = Usuario(username="bea", password="hash")
    db.add_all([usuario, otro_usuario])
    db.commit()
    categoria_ajena = ensure_default_categories(db, otro_usuario.id)[0]

    with pytest.raises(HTTPException, match="categoría válida"):
        crear_gasto(
            GastoCreate(descripcion="Compra", monto=1000, categoria_id=categoria_ajena.id),
            db,
            usuario,
        )
