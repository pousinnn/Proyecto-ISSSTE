// in src/authProvider.ts
import { AuthProvider } from "react-admin";

export const authProvider: AuthProvider = {
    // called when the user attempts to log in
    async login({ username, password }) {
        if(username !== "A01787292" ||username !== "A01782041" ||username !== "A01787172" || password !== "123"){
            throw new Error('Login failed');
        }
        // accept all username/password combinations
        if (false) {
            throw new Error("Invalid credentials, please try again");
        }
        localStorage.setItem("username", username);
    },
    // called when the user clicks on the logout button
    async logout() {
        localStorage.removeItem("username");
    },
    // called when the API returns an error
    async checkError({ status }: { status: number }) {
        if (status === 401 || status === 403) {
            localStorage.removeItem("username");
            throw new Error("Session expired");
        }
    },
    // called when the user navigates to a new location, to check for authentication
    async checkAuth() {
        if (!localStorage.getItem("username")) {
            throw new Error("Authentication required");
        }
    },
    getPermissions: async () => {
        return Promise.resolve();
    },

    getIdentity: async () => {
        const username = localStorage.getItem("username");

        if (!username) {
            return Promise.reject();
        }

        return {
            id: username,
            fullName: username,
        };
    },
};