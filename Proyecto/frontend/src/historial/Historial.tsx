
import { useState } from "react";

import {
  List,
  DataTable,
  SearchInput,
  DateField,
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

import { Visibility } from "@mui/icons-material";

import "./Historial.css";
import { EditarMedicion } from "./EditarMedicion";

// TIPO DE REGISTRO
const TipoField = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  if (!record) return null;

  const tipo = String(record.tipo || "");

  const colores: Record<
    string,
    "primary" | "secondary" | "success" | "info"
  > = {
    pesoytalla: "success",
    tallablanca: "secondary",
    perimetrocefalico: "info",
  };

  const etiquetas: Record<string, string> = {
    pesoytalla: translate("custom.resources.pesoytalla"),
    tallablanca: translate("custom.resources.tallablanca"),
    perimetrocefalico: translate(
      "custom.resources.perimetrocefalico"
    ),
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

// VENTANA DE DETALLES
const VerDetalles = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  const [open, setOpen] = useState(false);

  if (!record) return null;

  const campos = [
    {
      label: "ID",
      value: record.id,
    },
    {
      label: translate("custom.historial.name"),
      value: record.nombre,
    },
    {
      label: translate("custom.historial.type"),
      value: record.tipo,
    },
    {
      label: translate("custom.common.sex"),
      value: record.sexo,
    },
    {
      label: translate("custom.common.period"),
      value: record.periodo,
    },
    {
      label: translate("custom.common.zone"),
      value: record.zona,
    },
    {
      label: translate("custom.historial.date"),
      value: record.fecha,
    },
    {
      label: translate("custom.historial.result"),
      value: record.resultado,
    },
  ];

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Visibility />}
        onClick={() => setOpen(true)}
      >
        {translate("custom.historial.view")}
      </Button>

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
            {campos.map((campo) => (
              <Box key={campo.label}>
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

// COMPONENTE PRINCIPAL
export const Historial = () => {
  const translate = useTranslate();

  const { permissions } = usePermissions();
  //Solo el admin puede editar y borrar (el servidor también lo revisa)
  const puedeEditar = permissions === "admin";

  const filters = [
    <SearchInput
      key="search"
      source="q"
      alwaysOn
      placeholder={translate("custom.common.search")}
    />,
  ];

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
        <Box className="historial-content">
          <List
            title={translate("custom.historial.title")}
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
                bgcolor: "transparent",
                boxShadow: "none",
              },
            }}
          >
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
              {/* ID */}
              <DataTable.Col
                source="id"
                label="ID"
              />

              {/* NOMBRE */}
              <DataTable.Col
                source="nombre"
                label={translate("custom.historial.name")}
              />

              {/* TIPO DE MEDICIÓN */}
              <DataTable.Col
                source="tipo"
                label={translate("custom.historial.type")}
                render={() => <TipoField />}
              />

              {/* ZONA */}
              <DataTable.Col
                source="zona"
                label={translate("custom.common.zone")}
              />

              {/* FECHA */}
              <DataTable.Col
                source="fecha"
                label={translate("custom.historial.date")}
                render={() => (
                  <DateField source="fecha" />
                )}
              />

              {/* RESULTADO */}
              <DataTable.Col
                source="resultado"
                label={translate("custom.historial.result")}
              />

              {/* ACCIONES */}
              <DataTable.Col
                label={translate("custom.historial.actions")}
                render={() => (
                  <Stack direction="row" spacing={1}>
                    <VerDetalles />

                    {/* Editar y borrar: solo el admin */}
                    {puedeEditar && <EditarMedicion />}
                    {puedeEditar && (
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
      </Paper>
    </Box>
  );
};
