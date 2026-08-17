const API_URL = "http://localhost:8000";

// Obtener todos los gastos
export const getGastos = async () => {
    const response = await fetch(`${API_URL}/gastos/`);
    return await response.json();
};

// Crear un nuevo gasto
export const createGasto = async (gasto) => {
    const response = await fetch(`${API_URL}/gastos/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gasto)
    });
    return await response.json();
};

// Editar un gasto
export const updateGasto = async (id, gasto) => {
    const response = await fetch(`${API_URL}/gastos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gasto)
    });
    return await response.json();
};

// Eliminar un gasto
export const deleteGasto = async (id) => {
    const response = await fetch(`${API_URL}/gastos/${id}`, {
        method: "DELETE"
    });
    return await response.json();
};

// Obtener todas las categorías
export const getCategorias = async () => {
    const response = await fetch(`${API_URL}/categorias/`);
    return await response.json();
};

// Crear una nueva categoría
export const createCategoria = async (categoria) => {
    const response = await fetch(`${API_URL}/categorias/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoria)
    });
    return await response.json();
};

// Eliminar una categoría
export const deleteCategoria = async (id) => {
    const response = await fetch(`${API_URL}/categorias/${id}`, {
        method: "DELETE"
    });
    return await response.json();
};