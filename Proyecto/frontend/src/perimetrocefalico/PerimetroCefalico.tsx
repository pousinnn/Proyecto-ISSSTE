
import { useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Button,
  Grid,
  Alert,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import {
  Male,
  Female,
  ChildCare,
  Save,
} from "@mui/icons-material";

import {
  Title,
  useNotify,
  useCreate,
  useTranslate,
} from "react-admin";

import "./PerimetroCefalico.css";
import { SelectorPaciente } from "../SelectorPaciente";

type Sexo = "niño" | "niña";

export const PerimetroCefalico = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Traducciones
  const translate = useTranslate();
  const t = (key: string) => translate(`custom.${key}`);

  const notify = useNotify();
  const [create, { isPending }] = useCreate();

  // Estados
  const [sexo, setSexo] = useState<Sexo>("niño");
  const [periodo, setPeriodo] = useState("");
  const [zona, setZona] = useState("");
  const [paciente, setPaciente] = useState("");

  const [unidad, setUnidad] = useState("cm");
  const [cantidad, setCantidad] = useState("");

  const [resultado, setResultado] = useState<number | null>(null);

  // Convertir medida a centímetros
  const convertirACm = (
    valor: number,
    unidadMedida: string
  ): number => {
    switch (unidadMedida) {
      case "mm":
        return valor / 10;
      case "m":
        return valor * 100;
      case "in":
        return valor * 2.54;
      default:
        return valor;
    }
  };

  // Validar medida
  const obtenerMedida = (): number | null => {
    const valor = Number(cantidad);

    if (
      cantidad.trim() === "" ||
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      notify(t("notifications.invalidMeasurement"), {
        type: "warning",
      });
      return null;
    }

    return Number(
      convertirACm(valor, unidad).toFixed(2)
    );
  };

  // Convertir
  const calcular = () => {
    const medidaCm = obtenerMedida();

    if (medidaCm === null) return;

    setResultado(medidaCm);

    notify(t("notifications.calculated"), {
      type: "success",
    });
  };

  // Guardar registro
  const guardar = () => {
    if (!periodo || !zona.trim()) {
      notify(t("notifications.required"), {
        type: "warning",
      });
      return;
    }

    const medidaCm = obtenerMedida();

    if (medidaCm === null) return;

    const registro = {
      paciente,
      sexo,
      periodo,
      zona,
      perimetro: Number(cantidad),
      unidad,
      perimetroCm: medidaCm,
    };

    create(
      "perimetrocefalico",
      { data: registro },
      {
        onSuccess: () => {
          setResultado(medidaCm);

          notify(t("notifications.saved"), {
            type: "success",
          });
        },
        onError: (error) => {
          // Si el servidor explica por qué rechazó los datos, mostrar ese mensaje
          const mensaje = (error as { body?: { error?: string } })?.body?.error;
          notify(mensaje ?? t("notifications.error"), {
            type: "error",
          });
        },
      }
    );
  };

  // Colores dinámicos según el tema
  const labelColor = isDark ? "#e9ff75" : "#748c1f";

  const inputStyle = {
    "& .MuiInputBase-root": {
      bgcolor: "action.hover",
      color: "text.primary",
      borderRadius: 1.5,
    },
    "& .MuiInputBase-input::placeholder": {
      color: "text.secondary",
      opacity: 1,
    },
  };

  return (
    <Box
      className="perimetro-page"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Title title={t("perimetrocefalico.title")} />

      <Card
        className="perimetro-card"
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <CardContent>
          {/* ENCABEZADO */}

          <Box className="perimetro-header">
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                className="perimetro-title"
              >
                {t("perimetrocefalico.title")}
              </Typography>

              <Typography
                className="perimetro-subtitle"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                }}
              >
                014121305
              </Typography>
            </Box>

            <Box
              className="perimetro-mascota"
              sx={{
                bgcolor: "action.hover",
                color: "text.primary",
              }}
            >
              <ChildCare sx={{ fontSize: 45 }} />
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* COLUMNA IZQUIERDA */}

            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                className="perimetro-section"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                }}
              >
                {t("common.instructions")}
              </Typography>

              <Typography
                variant="body2"
                sx={{ mb: 2 }}
              >
                {t("perimetrocefalico.description")}
              </Typography>

              {/* SEXO */}

              <Typography
                className="perimetro-label"
                sx={{ color: labelColor }}
              >
                ⚥ {t("common.sex")}
              </Typography>

              <ToggleButtonGroup
                value={sexo}
                exclusive
                fullWidth
                onChange={(_, value: Sexo | null) => {
                  if (value !== null) {
                    setSexo(value);
                    setResultado(null);
                  }
                }}
                sx={{ mb: 3 }}
              >
                <ToggleButton value="niño">
                  {t("common.boy")}
                  <Male
                    sx={{
                      ml: 1,
                      color: "#55cfff",
                    }}
                  />
                </ToggleButton>

                <ToggleButton value="niña">
                  {t("common.girl")}
                  <Female
                    sx={{
                      ml: 1,
                      color: "#ef7fa9",
                    }}
                  />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* PERÍMETRO */}

              <Typography
                className="perimetro-label"
                sx={{ color: labelColor }}
              >
                ☆ {t("perimetrocefalico.perimeter")}
              </Typography>

              <Box className="perimetro-measure-row">
                <TextField
                  select
                  label={t("common.unit")}
                  value={unidad}
                  onChange={(e) => {
                    setUnidad(e.target.value);
                    setResultado(null);
                  }}
                  sx={{
                    ...inputStyle,
                    minWidth: 115,
                  }}
                  size="small"
                >
                  <MenuItem value="cm">cm</MenuItem>
                  <MenuItem value="mm">mm</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                  <MenuItem value="in">
                    {t("perimetrocefalico.inches")}
                  </MenuItem>
                </TextField>

                <TextField
                  type="number"
                  label={t("common.quantity")}
                  placeholder="45.5"
                  value={cantidad}
                  onChange={(e) => {
                    setCantidad(e.target.value);
                    setResultado(null);
                  }}
                  size="small"
                  fullWidth
                  sx={inputStyle}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: "any",
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* COLUMNA DERECHA */}

            <Grid size={{ xs: 12, md: 5 }}>
              {/* PERIODO */}

              <Typography
                className="perimetro-section"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                }}
              >
                {t("common.period")}
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={periodo}
                onChange={(e) =>
                  setPeriodo(e.target.value)
                }
                sx={{ ...inputStyle, mb: 3 }}
              >
                <MenuItem value="2026-1">
                  2026-1
                </MenuItem>
                <MenuItem value="2026-2">
                  2026-2
                </MenuItem>
                <MenuItem value="2027-1">
                  2027-1
                </MenuItem>
              </TextField>

              {/* PACIENTE (solo doctor y admin) */}

              <SelectorPaciente
                value={paciente}
                onChange={setPaciente}
                className="perimetro-section"
                inputSx={{ ...inputStyle, mb: 3 }}
              />

              {/* ZONA */}

              <Typography
                className="perimetro-section"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                }}
              >
                {t("common.zone")}
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder={t("common.zone")}
                value={zona}
                onChange={(e) =>
                  setZona(e.target.value)
                }
                sx={inputStyle}
              />
            </Grid>
          </Grid>

          {/* RESULTADO */}

          {resultado !== null && (
            <Alert
              severity="success"
              sx={{ mt: 3 }}
            >
              <Typography fontWeight="bold">
                {t("perimetrocefalico.result")}:{" "}
                {resultado.toFixed(2)} cm
              </Typography>
            </Alert>
          )}

          {/* BOTONES */}

          <Box className="perimetro-actions">
            <Button
              variant="outlined"
              onClick={calcular}
            >
              {t("common.convert")}
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={guardar}
              disabled={isPending}
              className="perimetro-guardar"
            >
              {t("common.save")}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
