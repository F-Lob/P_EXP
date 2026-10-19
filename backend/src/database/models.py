from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from ..database.database import Base
import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)

    categorias = relationship("Categoria", back_populates="usuario")
    gastos = relationship("Gasto", back_populates="usuario")
    tarjetas = relationship("Tarjeta", back_populates="usuario")
    sueldo = relationship("Sueldo", back_populates="usuario", uselist=False)
    metas = relationship("MetaAhorro", back_populates="usuario", cascade="all, delete-orphan")
    dia_pago = Column(Integer, nullable=True)
    onboarding_completado = Column(Boolean, default=False, nullable=False)


class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    presupuesto_mensual = Column(Numeric(12, 2), nullable=True)

    usuario = relationship("Usuario", back_populates="categorias")
    gastos = relationship("Gasto", back_populates="categoria")


class Gasto(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String, nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    es_fijo = Column(Boolean, default=False)
    dia_cobro = Column(Integer, nullable=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    categoria = relationship("Categoria", back_populates="gastos")
    usuario = relationship("Usuario", back_populates="gastos")


class Tarjeta(Base):
    __tablename__ = "tarjetas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="tarjetas")
    gastos_tarjeta = relationship("GastoTarjeta", back_populates="tarjeta")


class GastoTarjeta(Base):
    __tablename__ = "gastos_tarjeta"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String, nullable=False)
    monto_total = Column(Numeric(12, 2), nullable=False)
    cuotas_totales = Column(Integer, nullable=False)
    cuotas_pagadas = Column(Integer, default=0)
    fecha_inicio = Column(DateTime, default=datetime.datetime.utcnow)
    tarjeta_id = Column(Integer, ForeignKey("tarjetas.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    tarjeta = relationship("Tarjeta", back_populates="gastos_tarjeta")


class Sueldo(Base):
    __tablename__ = "sueldo"

    id = Column(Integer, primary_key=True, index=True)
    monto = Column(Numeric(12, 2), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, unique=True)

    usuario = relationship("Usuario", back_populates="sueldo")


class MetaAhorro(Base):
    __tablename__ = "metas_ahorro"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    monto_objetivo = Column(Numeric(12, 2), nullable=False)
    monto_ahorrado = Column(Numeric(12, 2), nullable=False, default=0)
    fecha_objetivo = Column(DateTime, nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    usuario = relationship("Usuario", back_populates="metas")
