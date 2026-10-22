
import {
  List,
  DataTable,
  SearchInput,
  SelectInput,
  useRecordContext,
  useTranslate,
} from "react-admin";
import { OPCIONES_REGION } from "../regiones";

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

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import "./Resultados.css";

// Menú lateral
const MenuResultados = () => {
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
    <Stack className="resultados-menu" spacing={1}>
      {secciones.map((seccion) => {
        //Marca el boton de la pagina donde estas
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

// Campo de contenido
const ContenidoField = () => {
  const record = useRecordContext();
  const translate = useTranslate();

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
      {record.contenido ||
        translate("custom.resultados.noContent")}
    </Typography>
  );
};

// Campo de zona
const ZonaField = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  if (!record) return null;

  return (
    <Chip
      label={
        record.zona ||
        translate("custom.resultados.noZone")
      }
      size="small"
      variant="outlined"
      color="primary"
    />
  );
};

// Filtros
const ResultadosFilters = () => {
  const translate = useTranslate();

  return [
    <SearchInput
      source="q"
      alwaysOn
      key="search"
      placeholder={translate("custom.common.search")}
    />,
    <SelectInput
      source="region"
      alwaysOn
      key="region"
      label={translate("custom.common.region", { _: "Región" })}
      choices={OPCIONES_REGION}
      emptyText={translate("custom.common.allRegions", { _: "Todas" })}
    />,
  ];
};

// Página principal
export const Resultados = () => {
  const translate = useTranslate();

  const filters = ResultadosFilters();

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
              title={translate("custom.resultados.title")}
              filters={filters}
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
              {/* COLUMNAS DE LA TABLA */}
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
                  label={translate("custom.resultados.name")}
                />

                <DataTable.Col
                  source="titulo"
                  label={translate("custom.resultados.titleColumn")}
                />

                <DataTable.Col
                  source="zona"
                  label={translate("custom.common.zone")}
                >
                  <ZonaField />
                </DataTable.Col>

                <DataTable.Col
                  source="region"
                  label={translate("custom.common.region", { _: "Región" })}
                />

                <DataTable.Col
                  source="contenido"
                  label={translate("custom.resultados.content")}
                >
                  <ContenidoField />
                </DataTable.Col>

                <DataTable.Col
                  source="fecha"
                  label={translate("custom.resultados.date")}
                />
              </DataTable>
            </List>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
