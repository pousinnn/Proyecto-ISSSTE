
import {
  List,
  DataTable,
  SearchInput,
  //TextField,
  DateField,
  //FunctionField,
  DeleteButton,
  usePermissions,
  useTranslate,
  useRecordContext,
} from "react-admin";

import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";

import {
  Assessment,
  History,
  MonitorWeight,
  Height,
  Straighten,
  Restaurant,
  Visibility,
} from "@mui/icons-material";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "./Historial.css";

// MENÚ LATERAL
const MenuHistorial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const translate = useTranslate();

  //Botones del menu con su ruta, icono y color
  const secciones = [
    {
      nombre: translate("custom.resources.resultados"),
      ruta: "/resultados",
      icono: <Assessment />,
      color: "#e87979",
    },
    {
      nombre: translate("custom.resultados.history"),
      ruta: "/historial",
      icono: <History />,
      color: "#44c9ac",
    },
    {
      nombre: translate("custom.resources.pesoytalla"),
      ruta: "/pesoytalla",
      icono: <MonitorWeight />,
      color: "#e879c8",
    },
    {
      nombre: translate("custom.resources.tallablanca"),
      ruta: "/tallablanca",
      icono: <Height />,
      color: "#d994f5",
    },
    {
      nombre: translate("custom.resources.perimetrocefalico"),
      ruta: "/perimetrocefalico",
      icono: <Straighten />,
      color: "#64b5f6",
    },
    {
      nombre: translate("custom.resultados.nutritionHistory"),
      ruta: "/historialnutricion",
      icono: <Restaurant />,
      color: "#c8a6ed",
    },
  ];

  return (
    <Stack className="historial-menu" spacing={1}>
      {secciones.map((seccion) => {
        //Marca el boton de la pagina donde estas
        const activo = location.pathname === seccion.ruta;

        return (
          <Button
            key={seccion.ruta}
            onClick={() => navigate(seccion.ruta)}
            startIcon={seccion.icono}
            className="historial-menu-btn"
            sx={{
              color: seccion.color,
              bgcolor: activo ? "action.selected" : "action.hover",
              borderLeft: activo
                ? `4px solid ${seccion.color}`
                : "4px solid transparent",
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: activo ? 700 : 500,
              "&:hover": {
                bgcolor: "action.selected",
              },
            }}
          >
            {seccion.nombre}
          </Button>
        );
      })}
    </Stack>
  );
};

// TIPO DE REGISTRO
const TipoField = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  if (!record) return null;

  const tipo = String(record.tipo || "");

  //Color y nombre de cada tipo de medicion
  const colores: Record<string, "primary" | "secondary" | "success" | "info"> = {
    pesoytalla: "success",
    tallablanca: "secondary",
    perimetrocefalico: "info",
  };

  const etiquetas: Record<string, string> = {
    pesoytalla: translate("custom.resources.pesoytalla"),
    tallablanca: translate("custom.resources.tallablanca"),
    perimetrocefalico: translate("custom.resources.perimetrocefalico"),
  };

  return (
    <Chip
      label={etiquetas[tipo] || tipo || "—"}
      color={colores[tipo] || "primary"}
      size="small"
      variant="outlined"
    />
  );
};

// MODAL PARA VISUALIZAR DETALLES
const VerDetalles = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  const [open, setOpen] = useState(false);

  if (!record) return null;

  //Datos que se muestran en la ventana
  const campos = [
    { label: "ID", value: record.id },
    { label: translate("custom.historial.name"), value: record.nombre },
    { label: translate("custom.historial.type"), value: record.tipo },
    { label: translate("custom.common.sex"), value: record.sexo },
    { label: translate("custom.common.period"), value: record.periodo },
    { label: translate("custom.common.zone"), value: record.zona },
    { label: translate("custom.historial.date"), value: record.fecha },
    { label: translate("custom.historial.result"), value: record.resultado },
  ];

  return (
    <>
      {/* BOTON VER */}
      <Button
        size="small"
        variant="outlined"
        startIcon={<Visibility />}
        onClick={() => setOpen(true)}
      >
        {translate("custom.historial.view")}
      </Button>

      {/* VENTANA CON LOS DETALLES */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {translate("custom.historial.details")}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {campos.map((campo, index) => (
              <Box key={index}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {campo.label}
                </Typography>

                <Typography variant="body1">
                  {campo.value === undefined ||
                  campo.value === null ||
                  campo.value === ""
                    ? "—"
                    : String(campo.value)}
                </Typography>

                <Divider sx={{ mt: 1 }} />
              </Box>
            ))}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            {translate("ra.action.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// FILTROS
const HistorialFilters = () => {
  const translate = useTranslate();

  return [
    <SearchInput
      key="search"
      source="q"
      alwaysOn
      placeholder={translate("custom.common.search")}
    />,
  ];
};

// COMPONENTE PRINCIPAL
export const Historial = () => {
  const translate = useTranslate();
  //Revisa el rol para saber si puede borrar
  const { permissions } = usePermissions();

  return (
    <Box
      className="historial-page"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Paper
        className="historial-container"
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Box className="historial-layout">
          {/* MENÚ LATERAL */}
          <MenuHistorial />

          {/* CONTENIDO */}
          <Box className="historial-content">
            <List
              title={translate("custom.historial.title")}
              filters={HistorialFilters()}
              perPage={10}
              sort={{
                field: "id",
                order: "DESC",
              }}
              exporter={false}
              actions={false}
              sx={{
                "& .RaList-main": {
                  bgcolor: "transparent",
                },
                "& .RaList-content": {
                  bgcolor: "transparent",
                  boxShadow: "none",
                },
              }}
            >
              {/* COLUMNAS DE LA TABLA */}
              <DataTable
                bulkActionButtons={false}
                sx={{
                  "& .MuiTableCell-head": {
                    bgcolor: "action.hover",
                    color: "text.primary",
                    fontWeight: "bold",
                  },
                  "& .MuiTableCell-body": {
                    color: "text.primary",
                  },
                  "& .MuiTableRow-root:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <DataTable.Col source="id" label="ID" />

                <DataTable.Col
                  source="nombre"
                  label={translate("custom.historial.name")}
                />

                <DataTable.Col
                  source="tipo"
                  label={translate("custom.historial.type")}
                  render={() => <TipoField />}
                />

                <DataTable.Col
                  source="zona"
                  label={translate("custom.common.zone")}
                />

                <DataTable.Col
                  source="fecha"
                  label={translate("custom.historial.date")}
                  render={() => <DateField source="fecha" />}
                />

                <DataTable.Col
                  source="resultado"
                  label={translate("custom.historial.result")}
                />

                <DataTable.Col
                  label={translate("custom.historial.actions")}
                  render={() => (
                    <Stack direction="row" spacing={1}>
                      <VerDetalles />
                      {/* Solo el admin puede borrar */}
                      {permissions === "admin" && (
                        <DeleteButton
                          mutationMode="pessimistic"
                          redirect={false}
                        />
                      )}
                    </Stack>
                  )}
                />
              </DataTable>
            </List>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
