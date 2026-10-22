import { useEffect } from "react";
import { MenuItem, TextField, Typography, SxProps, Theme } from "@mui/material";
import { useGetIdentity, useTranslate } from "react-admin";
import { REGIONES } from "./regiones";

// Selector de región para los formularios de captura.
// Si quien captura es un doctor, la región queda fija en la suya
// (el servidor también la fuerza, esto solo evita confusiones en pantalla).
type Props = {
    value: string;
    onChange: (value: string) => void;
    className: string;
    inputSx: SxProps<Theme>;
};

export const SelectorRegion = ({ value, onChange, className, inputSx }: Props) => {
    const translate = useTranslate();
    const { data: identity } = useGetIdentity();
    const regionFija = identity?.rol === "doctor" ? (identity.region as string | undefined) : undefined;

    useEffect(() => {
        if (regionFija && value !== regionFija) onChange(regionFija);
    }, [regionFija, value, onChange]);

    return (
        <>
            <Typography
                className={className}
                sx={{ bgcolor: "action.hover", color: "text.primary" }}
            >
                {translate("custom.common.region", { _: "Región" })}
            </Typography>

            <TextField
                select
                fullWidth
                size="small"
                value={regionFija ?? value}
                onChange={(e) => onChange(e.target.value)}
                disabled={Boolean(regionFija)}
                helperText={regionFija ? translate("custom.common.doctorRegion", { _: "Tu región asignada" }) : undefined}
                sx={inputSx}
                slotProps={{ select: { displayEmpty: true } }}
            >
                <MenuItem value="" disabled>
                    {translate("custom.common.selectRegion", { _: "Selecciona una región" })}
                </MenuItem>
                {REGIONES.map((r) => (
                    <MenuItem key={r} value={r}>
                        {r}
                    </MenuItem>
                ))}
            </TextField>
        </>
    );
};
