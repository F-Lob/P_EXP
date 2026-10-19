from database.database import Base, engine
from database.models import Usuario, Categoria, Gasto, Tarjeta, GastoTarjeta, Sueldo  # noqa: F401


Base.metadata.create_all(bind=engine)

print("Tablas creadas. Las categorías fijas se generan al registrar cada usuario.")
