import * as React from 'react';
import { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';

interface MyLoginPageProps {
    theme?: unknown;
}

const MyLoginPage = ({ theme }: MyLoginPageProps) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const login = useLogin();
    const notify = useNotify();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // will call authProvider.login({ email, password })
        login({ username, password }).catch(() =>
            notify('Invalid email or password')
        );
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Correo"
                
            />

            <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />

            <button type="submit">
                Login
            </button>
        </form>
    );
};

export default MyLoginPage;

