from database.database import engine, Base, SessionLocal
from database.models import Categoria, Gasto

Base.metadata.create_all(bind=engine)

categorias_iniciales = [
    "Entretencion",
    "Ahorro",
    "Comida",
    "Transporte",
    "Salud",
    "Vivienda",
    "Educacion"
]

db = SessionLocal()

for nombre in categorias_iniciales:
    existe = db.query(Categoria).filter(Categoria.nombre == nombre).first()
    if not existe:
        db.add(Categoria(nombre=nombre))

db.commit()
db.close()

print("Tablas y categorías creadas")