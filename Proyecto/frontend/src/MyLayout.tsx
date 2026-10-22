import * as React from 'react';
import { forwardRef } from 'react';
import {
    AppBar,
    Layout,
    UserMenu,
    useLogout,
    useGetIdentity,
    LayoutProps,
    LocalesMenuButton,
    ToggleThemeButton,
    LoadingIndicator,
} from 'react-admin';

import { MenuItem, MenuItemProps, Typography } from '@mui/material';
import ExitIcon from '@mui/icons-material/PowerSettingsNew';
import { BotonNuevoUsuario } from './usuarios/BotonNuevoUsuario';

// Botón de cerrar sesión
const MyLogoutButton = forwardRef<HTMLLIElement, MenuItemProps>(
    (props, ref) => {
        const logout = useLogout();

        const handleClick = () => logout();

        return (
            <MenuItem
                onClick={handleClick}
                ref={ref}
                {...props}
            >
                <ExitIcon sx={{ mr: 1 }} />
                Logout
            </MenuItem>
        );
    }
);

MyLogoutButton.displayName = 'MyLogoutButton';

// Menú de usuario
const MyUserMenu = () => (
    <UserMenu>
        <MyLogoutButton />
    </UserMenu>
);

// Botones de arriba a la derecha (nuevo usuario, idioma y tema)
const MyToolbar = () => (
    <>
        <BotonNuevoUsuario />
        <LocalesMenuButton />
        <ToggleThemeButton />
        <LoadingIndicator />
    </>
);

// Barra superior con identidad del usuario
const MyAppBar = () => {
    const { data: identity, isPending } = useGetIdentity();

    return (
        <AppBar userMenu={<MyUserMenu />} toolbar={<MyToolbar />}>
            <Typography
                variant="body1"
                sx={{ marginLeft: 'auto', marginRight: 2 }}
            >
                {!isPending && identity
                    ? ``
                    : ''}
            </Typography>
        </AppBar>
    );
};

// Layout principal
const MyLayout: React.FC<LayoutProps> = ({ children, ...props }) => (
    <Layout {...props} appBar={MyAppBar}>
        {children}
    </Layout>
);

export default MyLayout;
