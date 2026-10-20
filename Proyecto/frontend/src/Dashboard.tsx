// src/Dashboard.tsx
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
} from "@mui/material";

import { useGetIdentity, useTranslate } from "react-admin";

export const Dashboard = () => {
    const { data: identity, isPending, error } = useGetIdentity();
    const translate = useTranslate();

    if (isPending) {
        return <p>{translate("custom.dashboard.loading")}</p>;
    }

    if (error) {
        return <p>{translate("custom.dashboard.error")}</p>;
    }

    return (
        <>
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
