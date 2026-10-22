// src/Dashboard.tsx
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
} from "@mui/material";

import { useGetIdentity, useTranslate } from "react-admin";

//Pagina de inicio que saluda al usuario
export const Dashboard = () => {
    //Saca los datos del usuario que inicio sesion
    const { data: identity, isPending, error } = useGetIdentity();
    const translate = useTranslate();

    //Mensajes mientras carga o si hay error
    if (isPending) {
        return <p>{translate("custom.dashboard.loading")}</p>;
    }

    if (error) {
        return <p>{translate("custom.dashboard.error")}</p>;
    }

    return (
        <>
            {/* BIENVENIDA */}
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h5">
                        {translate("custom.dashboard.welcome", {
                            name: identity?.fullName ?? identity?.id,
                        })}
                    </Typography>

                    <Typography>
                        {translate("custom.dashboard.userId", {
                            id: identity?.id,
                        })}
                    </Typography>
                </CardContent>
            </Card>

            {/* DESCRIPCION DEL PANEL */}
            <Card>
                <CardHeader
                    title={translate("custom.dashboard.adminTitle")}
                />

                <CardContent>
                    {translate("custom.dashboard.adminDescription")}
                </CardContent>
            </Card>
        </>
    );
};
