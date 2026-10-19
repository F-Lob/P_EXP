from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import gastos, categorias, usuarios, tarjetas, gastos_tarjeta, sueldo, metas
from .database.settings import CORS_ORIGINS

app = FastAPI(
    title="Analizador de Gastos Personales",
    description="API para registrar y analizar gastos personales",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gastos.router)
app.include_router(categorias.router)
app.include_router(usuarios.router)
app.include_router(tarjetas.router)
app.include_router(gastos_tarjeta.router)
app.include_router(sueldo.router)
app.include_router(metas.router)

@app.get("/")
def root():
    return {"mensaje": "API funcionando correctamente"}
