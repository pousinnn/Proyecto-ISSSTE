import { useMemo, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { Title, useGetList, usePermissions, useTranslate } from "react-admin";

import { SelectorPaciente } from "../SelectorPaciente";

// Registro tal como lo devuelve el resource "resultados"
type Registro = {
  id: string;
  titulo?: string;
  contenido?: string;
  zona?: string;
  fecha?: string;
  createdAt?: string;
  created_at?: string;
};

const fechaDe = (r: Registro): string | undefined =>
  r.fecha ?? r.createdAt ?? r.created_at;

const formatearFecha = (valor?: string): string => {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-MX");
};

// Historial de nutrición: solo resultados de estudios de un paciente
export const HistorialNutricion = () => {
  const translate = useTranslate();
  const t = (key: string, fallback: string) =>
    translate(`custom.${key}`, { _: fallback });

  const { permissions } = usePermissions();
  const puedeElegirPaciente =
    permissions === "admin" || permissions === "doctor";

  const [paciente, setPaciente] = useState("");

  // Doctor/admin: hay que elegir paciente.
  // Paciente: el servidor ya limita a sus propios resultados.
  const { data, isPending, error } = useGetList<Registro>(
    "resultados",
    {
      pagination: { page: 1, perPage: 200 },
      sort: { field: "id", order: "DESC" },
      filter: paciente ? { paciente } : {},
    },
    { enabled: !puedeElegirPaciente || !!paciente }
  );

  // Más recientes primero (si el registro trae fecha)
  const filas = useMemo(() => {
    const lista = [...(data ?? [])];
    return lista.sort((a, b) => {
      const fa = new Date(fechaDe(a) ?? 0).getTime();
      const fb = new Date(fechaDe(b) ?? 0).getTime();
      return fb - fa;
    });
  }, [data]);

  const esperandoPaciente = puedeElegirPaciente && !paciente;

  return (
    <Box sx={{ p: 2, bgcolor: "background.default", color: "text.primary" }}>
      <Title title={t("historialnutricion.title", "Historial de nutrición")} />

      <Card sx={{ bgcolor: "background.paper", color: "text.primary" }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {t("historialnutricion.title", "Historial de nutrición")}
          </Typography>

          {puedeElegirPaciente && (
            <Box sx={{ maxWidth: 420, mb: 3 }}>
              <SelectorPaciente
                value={paciente}
                onChange={setPaciente}
                className="historial-section"
                inputSx={{
                  "& .MuiInputBase-root": {
                    bgcolor: "action.hover",
                    borderRadius: 1.5,
                  },
                }}
              />
            </Box>
          )}

          {esperandoPaciente ? (
            <Alert severity="info">
              {t(
                "historialnutricion.selectPatient",
                "Selecciona un paciente para ver sus resultados."
              )}
            </Alert>
          ) : error ? (
            <Alert severity="error">
              {t(
                "historialnutricion.error",
                "No se pudo cargar el historial."
              )}
            </Alert>
          ) : isPending ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filas.length === 0 ? (
            <Alert severity="info">
              {t(
                "historialnutricion.empty",
                "Este paciente aún no tiene resultados."
              )}
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("historialnutricion.date", "Fecha")}</TableCell>
                    <TableCell>{t("historialnutricion.study", "Estudio")}</TableCell>
                    <TableCell>{t("historialnutricion.result", "Resultado")}</TableCell>
                    <TableCell>{t("historialnutricion.zone", "Zona")}</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filas.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{formatearFecha(fechaDe(r))}</TableCell>
                      <TableCell>{r.titulo ?? "—"}</TableCell>
                      <TableCell>{r.contenido ?? "—"}</TableCell>
                      <TableCell>
                        {r.zona ? (
                          <Chip label={r.zona} size="small" variant="outlined" color="primary" />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
