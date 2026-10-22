import {
    List,
    DataTable,
    DateField,
    SearchInput,
    TextInput,
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    Labeled,
    SelectInput,
    fetchUtils,
    useNotify,
    usePermissions,
    useRecordContext,
    useRefresh,
    useTranslate,
} from "react-admin";
import { useState } from "react";
import {
    Box,
    Button,
    Chip,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField as MuiTextField,
    Typography,
} from "@mui/material";
import { API_URL } from "../dataProvider";
import { OPCIONES_REGION, REGIONES } from "../regiones";

// Las fechas vienen a medianoche UTC; se muestran en UTC para que no se recorran un día
const FECHA = { timeZone: "UTC" } as const;
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const NombreCompleto = () => {
    const r = useRecordContext();
    if (!r) return null;
    return <>{[r.paterno, r.materno, r.nombre].filter(Boolean).join(" ")}</>;
};

const Activo = () => {
    const r = useRecordContext();
    const translate = useTranslate();
    if (!r) return null;
    const activo = r.activo === 1 && r.baja !== 1;
    return (
        <Chip
            size="small"
            color={activo ? "success" : "default"}
            label={translate(activo ? "custom.padron.active" : "custom.padron.inactive", {
                _: activo ? "Activo" : "Baja",
            })}
        />
    );
};

// Cuadrícula año × mes con las inscripciones (1 = inscrito, 0 = no, vacío = sin dato)
const Inscripciones = () => {
    const r = useRecordContext();
    const translate = useTranslate();
    if (!r?.inscripciones) return null;

    const valores: Record<string, number | null> = r.inscripciones;
    const anios = [...new Set(Object.keys(valores).map((k) => k.slice(0, 4)))].sort();
    const sinFecha = Object.entries(r.inscripcionesSinFecha ?? {});

    const celda = (v: number | null | undefined) =>
        v === 1 ? "✓" : v === 0 ? "–" : "";

    return (
        <>
            <Table size="small" sx={{ width: "auto" }}>
                <TableHead>
                    <TableRow>
                        <TableCell />
                        {MESES.map((m) => (
                            <TableCell key={m} align="center">{m}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {anios.map((anio) => (
                        <TableRow key={anio}>
                            <TableCell sx={{ fontWeight: "bold" }}>{anio}</TableCell>
                            {MESES.map((_, i) => {
                                const v = valores[`${anio}-${String(i + 1).padStart(2, "0")}`];
                                return (
                                    <TableCell
                                        key={i}
                                        align="center"
                                        sx={{ color: v === 1 ? "success.main" : "text.secondary" }}
                                    >
                                        {celda(v)}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Typography variant="caption" color="text.secondary">
                {translate("custom.padron.legend", { _: "✓ inscrito · – no inscrito · vacío sin dato" })}
            </Typography>
            {sinFecha.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                    {translate("custom.padron.noDate", { _: "Sin fecha confirmada" })}:{" "}
                    {sinFecha.map(([k, v]) => `${k} = ${v ?? "—"}`).join(" · ")}
                </Typography>
            )}
        </>
    );
};

// Región del infante: el admin la puede asignar; los demás solo la ven
const RegionInfante = () => {
    const r = useRecordContext();
    const { permissions } = usePermissions();
    const translate = useTranslate();
    const notify = useNotify();
    const refresh = useRefresh();
    const [region, setRegion] = useState<string>("");
    const [guardando, setGuardando] = useState(false);

    if (!r) return null;
    if (permissions !== "admin") return <>{r.region || "—"}</>;

    const guardar = async () => {
        setGuardando(true);
        try {
            await fetchUtils.fetchJson(`${API_URL}/infantes/${r.id}/region`, {
                method: "PUT",
                body: JSON.stringify({ region }),
                headers: new Headers({ Authorization: `Bearer ${localStorage.getItem("token")}` }),
            });
            notify(translate("custom.padron.regionSaved", { _: "Región guardada" }), { type: "success" });
            refresh();
        } catch (e) {
            const mensaje = (e as { body?: { error?: string } })?.body?.error;
            notify(mensaje ?? translate("custom.notifications.error", { _: "Error" }), { type: "error" });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <MuiTextField
                select
                size="small"
                value={region || r.region || ""}
                onChange={(e) => setRegion(e.target.value)}
                sx={{ minWidth: 180 }}
                slotProps={{ select: { displayEmpty: true } }}
            >
                <MenuItem value="" disabled>
                    {translate("custom.common.selectRegion", { _: "Selecciona una región" })}
                </MenuItem>
                {REGIONES.map((x) => (
                    <MenuItem key={x} value={x}>{x}</MenuItem>
                ))}
            </MuiTextField>
            <Button
                variant="contained"
                size="small"
                onClick={guardar}
                disabled={guardando || !region || region === r.region}
            >
                {translate("custom.common.save", { _: "Guardar" })}
            </Button>
        </Box>
    );
};

export const PadronList = () => {
    const translate = useTranslate();
    const t = (k: string, def: string) => translate(`custom.padron.${k}`, { _: def });

    const filtros = [
        <SearchInput source="q" alwaysOn key="q" placeholder={t("search", "Nombre o CURP")} />,
        <SelectInput
            source="region"
            key="region"
            alwaysOn
            label={translate("custom.common.region", { _: "Región" })}
            choices={OPCIONES_REGION}
            emptyText={translate("custom.common.allRegions", { _: "Todas" })}
        />,
        <TextInput source="ebdi" key="ebdi" label="EBDI" />,
    ];

    return (
        <List
            title={t("title", "Padrón de infantes")}
            filters={filtros}
            sort={{ field: "paterno", order: "ASC" }}
            perPage={25}
            exporter={false}
        >
            <DataTable bulkActionButtons={false} rowClick="show">
                <DataTable.Col source="id_infante" label="ID" />
                <DataTable.Col source="paterno" label={t("name", "Nombre")}>
                    <NombreCompleto />
                </DataTable.Col>
                <DataTable.Col source="curp" label="CURP" disableSort />
                <DataTable.Col source="fnac" label={t("birthdate", "Nacimiento")}>
                    <DateField source="fnac" options={FECHA} />
                </DataTable.Col>
                <DataTable.Col source="ebdi" label="EBDI" />
                <DataTable.Col source="region" label={translate("custom.common.region", { _: "Región" })} disableSort />
                <DataTable.Col source="activo" label={t("status", "Estado")} disableSort>
                    <Activo />
                </DataTable.Col>
            </DataTable>
        </List>
    );
};

export const PadronShow = () => {
    const translate = useTranslate();
    const t = (k: string, def: string) => translate(`custom.padron.${k}`, { _: def });

    return (
        <Show title={t("detail", "Infante")}>
            <SimpleShowLayout>
                <Labeled label={t("name", "Nombre")}>
                    <NombreCompleto />
                </Labeled>
                <TextField source="curp" label="CURP" />
                <DateField source="fnac" label={t("birthdate", "Nacimiento")} options={FECHA} />
                <TextField source="genero" label={t("gender", "Género")} />
                <NumberField source="ebdi" label="EBDI" />
                <TextField source="ur" label="UR" />
                <Labeled label={translate("custom.common.region", { _: "Región" })}>
                    <RegionInfante />
                </Labeled>
                {/* TextField y no NumberField: es un identificador, no una cantidad (sin comas) */}
                <TextField source="matricula" label={t("parentId", "Matrícula del derechohabiente")} />
                <TextField source="estrato" label={t("stratum", "Estrato")} />
                <DateField source="freg" label={t("registered", "Fecha de registro")} options={FECHA} />
                <Labeled label={t("status", "Estado")}>
                    <Activo />
                </Labeled>
                <TextField source="grupoDisc" label={t("disability", "Discapacidad")} emptyText="—" />
                <TextField source="comentario" label={t("comment", "Comentario")} emptyText="—" />
                <Labeled label={t("enrollments", "Inscripciones por mes")}>
                    <Inscripciones />
                </Labeled>
            </SimpleShowLayout>
        </Show>
    );
};
