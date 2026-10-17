
import {
  List,
  DataTable,
  TextField,
  SearchInput,
  FunctionField,
  useRecordContext,
  useTranslate,
} from "react-admin";

import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
} from "@mui/material";

import {
  Assessment,
  History,
  MonitorWeight,
  Height,
  Straighten,
  Restaurant,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";
import "./Resultados.css";

// Filtros de búsqueda
const resultadosFilters = [
  <SearchInput
    source="q"
    alwaysOn
    key="search"
    placeholder="Buscar resultados..."
  />,
];

// Secciones del menú
const secciones = [
  {
    nombre: "Resultados",
    ruta: "/resultados",
    icono: <Assessment />,
    color: "#e87979",
  },
  {
    nombre: "Historial",
    ruta: "/historial",
    icono: <History />,
    color: "#44c9ac",
  },
  {
    nombre: "Peso y Talla",
    ruta: "/pesoytalla",
    icono: <MonitorWeight />,
    color: "#e879c8",
  },
  {
    nombre: "Blanco Familiar",
    ruta: "/tallablanca",
    icono: <Height />,
    color: "#d994f5",
  },
  {
    nombre: "Perímetro Cefálico",
    ruta: "/perimetrocefalico",
    icono: <Straighten />,
    color: "#64b5f6",
  },
  {
    nombre: "Historial Nutrición",
    ruta: "/historialnutricion",
    icono: <Restaurant />,
    color: "#c8a6ed",
  },
];

// Menú lateral
const MenuResultados = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Stack className="resultados-menu" spacing={1}>
      {secciones.map((seccion) => {
        const activo =
          location.pathname.startsWith(seccion.ruta);

        return (
          <Button
            key={seccion.ruta}
            onClick={() => navigate(seccion.ruta)}
            startIcon={seccion.icono}
            className="resultados-menu-btn"
            sx={{
              color: seccion.color,
              bgcolor: activo
                ? "action.selected"
                : "action.hover",
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

// Celda para el contenido
const ContenidoField = () => {
  const record = useRecordContext();

  if (!record) return null;

  return (
    <Typography
      variant="body2"
      sx={{
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        maxWidth: 280,
      }}
    >
      {record.contenido || "Sin contenido"}
    </Typography>
  );
};

// Celda para la zona
const ZonaField = () => {
  const record = useRecordContext();

  if (!record) return null;

  return (
    <Chip
      label={record.zona || "Sin zona"}
      size="small"
      variant="outlined"
      color="primary"
    />
  );
};

// Página principal
export const Resultados = () => {
  return (
    <Box
      className="resultados-page"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Paper
        className="resultados-container"
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Box className="resultados-layout">
          {/* MENÚ LATERAL */}
          <MenuResultados />

          {/* TABLA */}
          <Box className="resultados-content">
            <List
              title="Resultados"
              filters={resultadosFilters}
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
                  boxShadow: "none",
                  bgcolor: "transparent",
                },
              }}
            >
              <DataTable
                bulkActionButtons={false}
                sx={{
                  "& .MuiTableCell-head": {
                    bgcolor: "action.hover",
                    fontWeight: "bold",
                    color: "text.primary",
                  },
                  "& .MuiTableCell-body": {
                    color: "text.primary",
                  },
                  "& .MuiTableRow-root:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <DataTable.Col
                  source="id"
                  label="ID"
                />

                <DataTable.Col
                  source="nombre"
                  label="Nombre"
                />

                <DataTable.Col
                  source="titulo"
                  label="Título"
                />

                <DataTable.Col
                  label="Zona"
                  source="zona"
                >
                  <ZonaField />
                </DataTable.Col>

                <DataTable.Col
                  label="Contenido"
                  source="contenido"
                >
                  <ContenidoField />
                </DataTable.Col>

                <DataTable.Col
                  source="fecha"
                  label="Fecha"
                />
              </DataTable>
            </List>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
