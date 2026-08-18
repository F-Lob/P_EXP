const API_URL = "http://localhost:8000";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

// ---- GASTOS ----

export const getGastos = async () => {
  const response = await fetch(`${API_URL}/gastos/`, { headers: headers() });
  return await response.json();
};

export const createGasto = async (gasto) => {
  const response = await fetch(`${API_URL}/gastos/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(gasto)
  });
  return await response.json();
};

export const updateGasto = async (id, gasto) => {
  const response = await fetch(`${API_URL}/gastos/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(gasto)
  });
  return await response.json();
};

export const deleteGasto = async (id) => {
  const response = await fetch(`${API_URL}/gastos/${id}`, {
    method: "DELETE",
    headers: headers()
  });
  return await response.json();
};

// ---- CATEGORIAS ----

export const getCategorias = async () => {
  const response = await fetch(`${API_URL}/categorias/`, { headers: headers() });
  return await response.json();
};

export const createCategoria = async (categoria) => {
  const response = await fetch(`${API_URL}/categorias/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(categoria)
  });
  return await response.json();
};

export const deleteCategoria = async (id) => {
  const response = await fetch(`${API_URL}/categorias/${id}`, {
    method: "DELETE",
    headers: headers()
  });
  return await response.json();
};