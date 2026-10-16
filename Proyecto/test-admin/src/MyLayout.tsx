import * as React from 'react';
import { forwardRef } from 'react';
import { AppBar, Layout, UserMenu, useLogout, LayoutProps } from 'react-admin';
import { MenuItem, MenuItemProps } from '@mui/material';
import ExitIcon from '@mui/icons-material/PowerSettingsNew';

// It's important to pass the ref to allow Material UI to manage the keyboard navigation
const MyLogoutButton = forwardRef<HTMLLIElement, MenuItemProps>((props, ref) => {
    const logout = useLogout();
    const handleClick = () => logout();
    return (
        <MenuItem
            onClick={handleClick}
            ref={ref}
            // It's important to pass the props to allow Material UI to manage the keyboard navigation
            {...props}
        >
            <ExitIcon /> Logout
        </MenuItem>
    );
});

MyLogoutButton.displayName = 'MyLogoutButton';

const MyUserMenu = () => (
    <UserMenu>
        <MyLogoutButton />
    </UserMenu>
);

const MyAppBar = () => <AppBar userMenu={<MyUserMenu />} />;

const MyLayout: React.FC<LayoutProps> = ({ children, ...props }) => (
    <Layout {...props} appBar={MyAppBar}>
        {children}
    </Layout>
);

export default MyLayout;