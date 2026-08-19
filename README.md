## p_exp
    Proyecto personal para llevar los gastos personales de mejor manera

## 1RA Iteracion

    Definicion de tecnologias:

    Manejo de datos: Pandas, NumPy
    Almacenamiento: SQLAlchemy
    Visualizacion: Plotly
    Backend: FastAPI(Uvicorn)
    Frontend: React + Vite

    Conexion de BDD PostgreSQL correcta y funcional

## 2DA Iteración
    
    Creación de las tablas con python en PostgreSQL
    Re-estructuración de carpetas
    Ocultar datos sensibles públicos a privados

## 3RA Iteracion 

    Se crean los endpoints basicos para la aplicacion
    Se realizan pruebas a los endpoints, comprobando que todos funcionen
    Se inicializa React con Vite en el Frontend
    Se añaden dependencias del Frontend
    Configuracion de entorno para Tailwind
    Instalacion de Recharts
    Estructuracion de carpetas Frontend

## 4TA Iteración
    Creación de servicios para comunicación Frontend - Backend
    Configuración de rutas con react-router-dom
    Creación de componentes
    Desarrollo de página Dashboard, Gastos, Categorias
    Aplicación web funcional y conectada end-to-end

## 5TA Iteración
    Mejoras de UX en Gastos y Categorías
    Validaciones en formularios
    Mensajes de feedback al usuario (Toast)
    Confirmación antes de eliminar
    Total de gastos visible por filtro y por categoría
    Filtros y búsqueda de dato
    Exportación de gastos a CSV y PDF

## 6TA Iteración
    Se añade Auth
    Se añade formulario de registro y login
    Usuarios creados en la base de datos
    Usuarios independientes con datos independientes
    Mensajes de error, falla en registro/login

## 7MA Iteración
    Implementación de tarjetas de crédito con vista de detalle
    Control de cuotas por gasto de tarjeta (pagadas y restantes)
    Barra de progreso visual por cuota
    Registro y actualización de sueldo mensual
    Saldo disponible en el Dashboard (sueldo - gastos)
    Gastos fijos con día de cobro y filtro por tipo
    Tarjetas de resumen en Dashboard (sueldo, saldo, mes actual, total)
    Desglose de gastos fijos vs variables

## Instrucciones para arrancar el proyecto

## Requisitos
- Python 3.10+
- Node.js 18+
- PostgreSQL instalado y corriendo

## Backend
1. Activar el entorno virtual dentro del backend/:
   - python -m venv env
   - env\Scripts\activate
2. Instalar dependencias:
   - pip install fastapi uvicorn sqlalchemy psycopg2-binary pandas python-dotenv
3. Crear el archivo src/database/config.py con las credenciales de la base de datos:
   - DB_USER
   - DB_PASSWORD
   - DB_HOST
   - DB_PORT
   - DB_NAME
   - DATABASE_URL
4. Ejecutar py create_tables.py para crear las tablas e insertar categorías iniciales
5. Arrancar el backend:
   - uvicorn src.main:app --reload

## Frontend
1. Instalar dependencias dentro de frontend/:
   - npm install
2. Hacer funcionar el frontend:
   - npm run dev


