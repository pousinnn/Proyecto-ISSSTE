// in src/authProvider.ts
import { AuthProvider } from "react-admin";
import { API_URL } from "./dataProvider";

// La sesión vive en el token JWT que entrega el API. Aquí no hay usuarios
// ni contraseñas: el servidor es quien decide si las credenciales son válidas.
const limpiarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("identity");
};

export const authProvider: AuthProvider = {
    // called when the user attempts to log in
    async login({ username, password }) {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(body.error ?? "Login failed");
        }

        localStorage.setItem("token", body.token);
        localStorage.setItem("identity", JSON.stringify(body.usuario));
    },
    // called when the user clicks on the logout button
    async logout() {
        limpiarSesion();
    },
    // called when the API returns an error
    async checkError({ status }: { status: number }) {
        // 401 = token inválido o expirado → cerrar sesión.
        // 403 = sesión válida pero sin permiso para esa acción → no cerrar sesión.
        if (status === 401) {
            limpiarSesion();
            throw new Error("Session expired");
        }
    },
    // called when the user navigates to a new location, to check for authentication
    async checkAuth() {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        // Si el token ya expiró, pedir login sin esperar a que el API falle.
        // (Solo es comodidad: el servidor siempre vuelve a verificar la firma.)
        let expirado = true;
        try {
            const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
            expirado = payload.exp * 1000 < Date.now();
        } catch {
            // token mal formado → se trata como expirado
        }
        if (expirado) {
            limpiarSesion();
            throw new Error("Session expired");
        }
    },
    getPermissions: async () => {
        const identity = JSON.parse(localStorage.getItem("identity") ?? "null");
        return identity?.rol;
    },

    getIdentity: async () => {
        const identity = JSON.parse(localStorage.getItem("identity") ?? "null");

        if (!identity) {
            throw new Error("No identity");
        }

        return identity;
    },
};
