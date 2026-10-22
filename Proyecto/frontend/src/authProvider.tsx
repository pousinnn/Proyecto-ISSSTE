// in src/authProvider.ts
import { AuthProvider } from "react-admin";
import { API_URL } from "./dataProvider";

//Borra el token y los datos del usuario al salir
const limpiarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("identity");
};

export const authProvider: AuthProvider = {
    //Inicia sesion mandando usuario y contraseña al servidor
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

        //Guarda el token y los datos del usuario
        localStorage.setItem("token", body.token);
        localStorage.setItem("identity", JSON.stringify(body.usuario));
    },
    //Cierra la sesion
    async logout() {
        limpiarSesion();
    },
    //Revisa los errores del servidor
    async checkError({ status }: { status: number }) {
        //Si el token ya no sirve se cierra la sesion
        if (status === 401) {
            limpiarSesion();
            throw new Error("Session expired");
        }
    },
    //Revisa que el usuario siga con sesion al cambiar de pagina
    async checkAuth() {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication required");
        }

        //Si el token ya expiro pide iniciar sesion otra vez
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
    //Regresa el rol del usuario (admin, doctor o paciente)
    getPermissions: async () => {
        const identity = JSON.parse(localStorage.getItem("identity") ?? "null");
        return identity?.rol;
    },

    //Regresa los datos del usuario que inicio sesion
    getIdentity: async () => {
        const identity = JSON.parse(localStorage.getItem("identity") ?? "null");

        if (!identity) {
            throw new Error("No identity");
        }

        return identity;
    },
};
