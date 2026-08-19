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

// ---- TARJETAS ----

export const getTarjetas = async () => {
  const response = await fetch(`${API_URL}/tarjetas/`, { headers: headers() });
  return await response.json();
};

export const createTarjeta = async (tarjeta) => {
  const response = await fetch(`${API_URL}/tarjetas/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(tarjeta)
  });
  return await response.json();
};

export const deleteTarjeta = async (id) => {
  const response = await fetch(`${API_URL}/tarjetas/${id}`, {
    method: "DELETE",
    headers: headers()
  });
  return await response.json();
};

// ---- GASTOS TARJETA ----

export const getGastosTarjeta = async (tarjetaId) => {
  const response = await fetch(`${API_URL}/gastos-tarjeta/tarjeta/${tarjetaId}`, {
    headers: headers()
  });
  return await response.json();
};

export const createGastoTarjeta = async (gasto) => {
  const response = await fetch(`${API_URL}/gastos-tarjeta/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(gasto)
  });
  return await response.json();
};

export const pagarCuota = async (gastoId) => {
  const response = await fetch(`${API_URL}/gastos-tarjeta/${gastoId}/pagar-cuota`, {
    method: "PATCH",
    headers: headers()
  });
  return await response.json();
};

export const deleteGastoTarjeta = async (id) => {
  const response = await fetch(`${API_URL}/gastos-tarjeta/${id}`, {
    method: "DELETE",
    headers: headers()
  });
  return await response.json();
};

// ---- SUELDO ----

export const getSueldo = async () => {
  const response = await fetch(`${API_URL}/sueldo/`, { headers: headers() });
  if (response.status === 404) return null;
  return await response.json();
};

export const setSueldo = async (monto) => {
  const response = await fetch(`${API_URL}/sueldo/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ monto })
  });
  return await response.json();
};