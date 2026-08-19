from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..database.models import GastoTarjeta, Usuario
from ..schemas.gastos_tarjeta import GastoTarjetaCreate, GastoTarjetaResponse
from ..auth.auth import get_usuario_actual
from typing import List
import datetime

router = APIRouter(
    prefix="/gastos-tarjeta",
    tags=["Gastos Tarjeta"]
)

@router.get("/tarjeta/{tarjeta_id}", response_model=List[GastoTarjetaResponse])
def listar_gastos_tarjeta(
    tarjeta_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    gastos = db.query(GastoTarjeta).filter(
        GastoTarjeta.tarjeta_id == tarjeta_id,
        GastoTarjeta.usuario_id == usuario.id
    ).all()

    # Calcular campos derivados
    resultado = []
    for g in gastos:
        monto_por_cuota = round(g.monto_total / g.cuotas_totales, 2)
        cuotas_restantes = g.cuotas_totales - g.cuotas_pagadas
        resultado.append(GastoTarjetaResponse(
            id=g.id,
            descripcion=g.descripcion,
            monto_total=g.monto_total,
            cuotas_totales=g.cuotas_totales,
            cuotas_pagadas=g.cuotas_pagadas,
            fecha_inicio=g.fecha_inicio,
            tarjeta_id=g.tarjeta_id,
            monto_por_cuota=monto_por_cuota,
            cuotas_restantes=cuotas_restantes
        ))
    return resultado

@router.post("/", response_model=GastoTarjetaResponse)
def crear_gasto_tarjeta(
    gasto: GastoTarjetaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    nuevo = GastoTarjeta(
        descripcion=gasto.descripcion,
        monto_total=gasto.monto_total,
        cuotas_totales=gasto.cuotas_totales,
        cuotas_pagadas=gasto.cuotas_pagadas,
        fecha_inicio=gasto.fecha_inicio or datetime.datetime.utcnow(),
        tarjeta_id=gasto.tarjeta_id,
        usuario_id=usuario.id
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    monto_por_cuota = round(nuevo.monto_total / nuevo.cuotas_totales, 2)
    cuotas_restantes = nuevo.cuotas_totales - nuevo.cuotas_pagadas

    return GastoTarjetaResponse(
        id=nuevo.id,
        descripcion=nuevo.descripcion,
        monto_total=nuevo.monto_total,
        cuotas_totales=nuevo.cuotas_totales,
        cuotas_pagadas=nuevo.cuotas_pagadas,
        fecha_inicio=nuevo.fecha_inicio,
        tarjeta_id=nuevo.tarjeta_id,
        monto_por_cuota=monto_por_cuota,
        cuotas_restantes=cuotas_restantes
    )

@router.patch("/{gasto_id}/pagar-cuota")
def pagar_cuota(
    gasto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    gasto = db.query(GastoTarjeta).filter(
        GastoTarjeta.id == gasto_id,
        GastoTarjeta.usuario_id == usuario.id
    ).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")

    if gasto.cuotas_pagadas >= gasto.cuotas_totales:
        raise HTTPException(status_code=400, detail="Todas las cuotas ya fueron pagadas")

    gasto.cuotas_pagadas += 1
    db.commit()
    db.refresh(gasto)
    return {"mensaje": f"Cuota pagada. Llevas {gasto.cuotas_pagadas} de {gasto.cuotas_totales}"}

@router.delete("/{gasto_id}")
def eliminar_gasto_tarjeta(
    gasto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_usuario_actual)
):
    gasto = db.query(GastoTarjeta).filter(
        GastoTarjeta.id == gasto_id,
        GastoTarjeta.usuario_id == usuario.id
    ).first()
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")

    db.delete(gasto)
    db.commit()
    return {"mensaje": "Gasto de tarjeta eliminado correctamente"}