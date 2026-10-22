import jsonServerProvider from 'ra-data-json-server';
import { fetchUtils } from 'react-admin';

//Direccion del servidor
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

// Agrega el token de sesión a cada petición que va al API
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
    const token = localStorage.getItem("token");
    const headers = new Headers(options.headers ?? { Accept: "application/json" });
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    return fetchUtils.fetchJson(url, { ...options, headers });
};

//Conecta la pagina con el servidor
export const dataProvider = jsonServerProvider(API_URL, httpClient);
