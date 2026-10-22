import { MenuItem, TextField, Typography, SxProps, Theme } from "@mui/material";
import { useTranslate } from "react-admin";
import { REGIONES } from "./regiones";

// Selector de región para los formularios de captura
type Props = {
    value: string;
    onChange: (value: string) => void;
    className: string;
    inputSx: SxProps<Theme>;
};

export const SelectorRegion = ({ value, onChange, className, inputSx }: Props) => {
    const translate = useTranslate();

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
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
