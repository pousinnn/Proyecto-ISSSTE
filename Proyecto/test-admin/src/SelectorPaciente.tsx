import { MenuItem, TextField, Typography, SxProps, Theme } from "@mui/material";
import { useGetList, usePermissions, useTranslate } from "react-admin";

// Lista de pacientes para elegir de quién es la medición.
// Solo la ven admin y doctor; un paciente siempre captura para sí mismo
// (y aunque alguien la forzara a aparecer, el servidor ignora el valor).
type Props = {
    value: string;
    onChange: (value: string) => void;
    className: string;
    inputSx: SxProps<Theme>;
};

export const SelectorPaciente = ({ value, onChange, className, inputSx }: Props) => {
    const translate = useTranslate();
    const { permissions } = usePermissions();
    const puedeElegir = permissions === "admin" || permissions === "doctor";

    const { data: pacientes = [] } = useGetList(
        "pacientes",
        { pagination: { page: 1, perPage: 100 }, sort: { field: "nombre", order: "ASC" } },
        { enabled: puedeElegir },
    );

    if (!puedeElegir) return null;

    return (
        <>
            <Typography
                className={className}
                sx={{ bgcolor: "action.hover", color: "text.primary" }}
            >
                {translate("custom.common.patient")}
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
                    {translate("custom.common.selectPatient")}
                </MenuItem>
                {pacientes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                        {p.nombre}
                    </MenuItem>
                ))}
            </TextField>
        </>
    );
};
