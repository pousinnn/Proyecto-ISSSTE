import { useState } from "react";
import {
    useDataProvider,
    useNotify,
    useRecordContext,
    useRefresh,
    useTranslate,
} from "react-admin";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";
import { Edit } from "@mui/icons-material";

//Campos de cada tipo de medición: [campo, etiqueta, tipo, opciones]
type Campo = { campo: string; etiqueta: string; def: string; tipo: "texto" | "numero" | "fecha" | "opcion"; opciones?: string[] };

const COMUNES: Campo[] = [
    { campo: "sexo", etiqueta: "common.sex", def: "Sexo", tipo: "opcion", opciones: ["niño", "niña"] },
    { campo: "periodo", etiqueta: "common.period", def: "Periodo", tipo: "opcion", opciones: ["2026-1", "2026-2", "2027-1"] },
    { campo: "zona", etiqueta: "common.zone", def: "EBDI / Zona", tipo: "texto" },
];

const CAMPOS: Record<string, Campo[]> = {
    pesoytalla: [
        ...COMUNES,
        { campo: "fechaNacimiento", etiqueta: "pesoytalla.birthdate", def: "Fecha de nacimiento", tipo: "fecha" },
        { campo: "altura", etiqueta: "pesoytalla.height", def: "Altura", tipo: "numero" },
        { campo: "unidadAltura", etiqueta: "common.unit", def: "Unidad", tipo: "opcion", opciones: ["cm", "m"] },
        { campo: "peso", etiqueta: "pesoytalla.weight", def: "Peso", tipo: "numero" },
        { campo: "unidadPeso", etiqueta: "common.unit", def: "Unidad", tipo: "opcion", opciones: ["kg", "lb"] },
    ],
    tallablanca: [
        ...COMUNES,
        { campo: "alturaPadre", etiqueta: "tallablanca.fatherHeight", def: "Altura padre", tipo: "numero" },
        { campo: "unidadPadre", etiqueta: "common.unit", def: "Unidad", tipo: "opcion", opciones: ["cm", "m", "in"] },
        { campo: "alturaMadre", etiqueta: "tallablanca.motherHeight", def: "Altura madre", tipo: "numero" },
        { campo: "unidadMadre", etiqueta: "common.unit", def: "Unidad", tipo: "opcion", opciones: ["cm", "m", "in"] },
    ],
    perimetrocefalico: [
        ...COMUNES,
        { campo: "perimetro", etiqueta: "perimetrocefalico.perimeter", def: "Perímetro", tipo: "numero" },
        { campo: "unidad", etiqueta: "common.unit", def: "Unidad", tipo: "opcion", opciones: ["cm", "mm", "m", "in"] },
    ],
};

//Botón EDITAR del historial: abre la medición en un formulario y la guarda
export const EditarMedicion = () => {
    const record = useRecordContext();
    const translate = useTranslate();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();

    const [abierto, setAbierto] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [original, setOriginal] = useState<Record<string, unknown> | null>(null);
    const [valores, setValores] = useState<Record<string, string>>({});

    if (!record) return null;

    //El id del historial es "tipo-id": se separa para pedir la medición original
    const tipo = String(record.tipo);
    const id = String(record.id).slice(tipo.length + 1);
    const campos = CAMPOS[tipo] ?? [];
    const t = (k: string, def: string) => translate(`custom.${k}`, { _: def });

    //Muestra el mensaje que manda el servidor si algo sale mal
    const avisarError = (e: unknown) => {
        const mensaje = (e as { body?: { error?: string } })?.body?.error;
        notify(mensaje ?? t("notifications.error", "Error al guardar el registro"), { type: "error" });
    };

    //Abre el formulario con los datos actuales de la medición
    const abrir = async () => {
        setAbierto(true);
        setCargando(true);
        try {
            const { data } = await dataProvider.getOne(tipo, { id });
            setOriginal(data);
            setValores(Object.fromEntries(campos.map((c) => [c.campo, String(data[c.campo] ?? "")])));
        } catch (e) {
            avisarError(e);
            setAbierto(false);
        } finally {
            setCargando(false);
        }
    };

    //Guarda los cambios; el servidor vuelve a calcular IMC, talla blanco, etc.
    const guardar = async () => {
        if (!original) return;
        setGuardando(true);
        try {
            const data = {
                ...Object.fromEntries(
                    campos.map((c) => [c.campo, c.tipo === "numero" ? Number(valores[c.campo]) : valores[c.campo]]),
                ),
                region: original.region,
            };
            await dataProvider.update(tipo, { id, data, previousData: original as never });
            notify(t("historial.updated", "Registro actualizado correctamente"), { type: "success" });
            setAbierto(false);
            refresh();
        } catch (e) {
            avisarError(e);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            <Button size="small" variant="outlined" startIcon={<Edit />} onClick={abrir}>
                {t("historial.edit", "Editar")}
            </Button>

            <Dialog open={abierto} onClose={() => setAbierto(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    {t("historial.editTitle", "Editar registro")} · {record.nombre}
                </DialogTitle>

                <DialogContent dividers>
                    {cargando ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : (
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            {/* UN CAMPO POR DATO, SEGÚN EL TIPO DE MEDICIÓN */}
                            {campos.map((c) => (
                                <TextField
                                    key={c.campo}
                                    label={t(c.etiqueta, c.def)}
                                    size="small"
                                    fullWidth
                                    select={c.tipo === "opcion"}
                                    type={c.tipo === "numero" ? "number" : c.tipo === "fecha" ? "date" : "text"}
                                    value={valores[c.campo] ?? ""}
                                    onChange={(e) => setValores({ ...valores, [c.campo]: e.target.value })}
                                    slotProps={{
                                        inputLabel: { shrink: true },
                                        htmlInput: c.tipo === "numero" ? { min: 0, step: "any" } : undefined,
                                    }}
                                >
                                    {c.opciones?.map((o) => (
                                        <MenuItem key={o} value={o}>
                                            {o}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            ))}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setAbierto(false)}>{translate("ra.action.cancel")}</Button>
                    <Button variant="contained" onClick={guardar} disabled={cargando || guardando}>
                        {t("common.save", "Guardar")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
