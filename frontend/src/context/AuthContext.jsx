import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [usuario, setUsuario] = useState(localStorage.getItem("usuario") || null);

  const login = (nuevoToken, nombreUsuario) => {
    localStorage.setItem("token", nuevoToken);
    localStorage.setItem("usuario", nombreUsuario);
    setToken(nuevoToken);
    setUsuario(nombreUsuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}