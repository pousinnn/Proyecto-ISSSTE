import { useEffect } from "react";
import { MenuItem, TextField, Typography, SxProps, Theme } from "@mui/material";
import { usePermissions, useTranslate } from "react-admin";
import { REGIONES } from "./regiones";

//Selector de región: solo lo usa el admin; para los demás la región sale del padrón del niño
type Props = {
    value: string;
    onChange: (value: string) => void;
    className: string;
    inputSx: SxProps<Theme>;
};

//Valor que se manda cuando la región la pone el servidor
const DEL_PADRON = "del-padron";

export const SelectorRegion = ({ value, onChange, className, inputSx }: Props) => {
    const translate = useTranslate();
    const { permissions } = usePermissions();
    const esAdmin = permissions === "admin";

    //Si no es admin, marca la región como "del padrón" para que el formulario deje guardar
    useEffect(() => {
        if (permissions && !esAdmin && value !== DEL_PADRON) onChange(DEL_PADRON);
    }, [permissions, esAdmin, value, onChange]);

    //Los que no son admin no escogen región
    if (!esAdmin) return null;

    return (
        <>
            <Typography
                className={className}
                sx={{ bgcolor: "action.hover", color: "text.primary" }}
            >
                {translate("custom.common.region", { _: "Región" })}
            </Typography>

            {/* MENU DE REGIONES */}
            <TextField
                select
                fullWidth
                size="small"
                value={value === DEL_PADRON ? "" : value}
                onChange={(e) => onChange(e.target.value)}
                helperText={translate("custom.common.regionFromRegistry", {
                    _: "Si el niño está en el padrón, se usa su región",
                })}
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
