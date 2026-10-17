
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
  Calculate,
} from "@mui/icons-material";

import {
  Title,
  useNotify,
  useCreate,
  useTranslate,
} from "react-admin";

import "./TallaBlanca.css";

type Sexo = "niño" | "niña";
type Unidad = "cm" | "m" | "in";

export const TallaBlanca = () => {
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

  const [alturaPadre, setAlturaPadre] = useState("");
  const [unidadPadre, setUnidadPadre] = useState<Unidad>("cm");

  const [alturaMadre, setAlturaMadre] = useState("");
  const [unidadMadre, setUnidadMadre] = useState<Unidad>("cm");

  const [resultado, setResultado] = useState<number | null>(null);

  // Convertir altura a centímetros
  const convertirACm = (
    valor: number,
    unidad: Unidad
  ): number => {
    switch (unidad) {
      case "m":
        return valor * 100;

      case "in":
        return valor * 2.54;

      default:
        return valor;
    }
  };

  // Validar y calcular talla blanco familiar
  const obtenerCalculo = () => {
    const padre = Number(alturaPadre);
    const madre = Number(alturaMadre);

    if (
      alturaPadre.trim() === "" ||
      alturaMadre.trim() === "" ||
      !Number.isFinite(padre) ||
      !Number.isFinite(madre) ||
      padre <= 0 ||
      madre <= 0
    ) {
      notify(t("notifications.invalidMeasurement"), {
        type: "warning",
      });

      return null;
    }

    const padreCm = convertirACm(padre, unidadPadre);
    const madreCm = convertirACm(madre, unidadMadre);

    // Fórmula de talla blanco familiar
    const tallaBlanco =
      sexo === "niño"
        ? (padreCm + madreCm + 13) / 2
        : (padreCm + madreCm - 13) / 2;

    return {
      alturaPadreCm: Number(padreCm.toFixed(2)),
      alturaMadreCm: Number(madreCm.toFixed(2)),
      tallaBlancoCm: Number(tallaBlanco.toFixed(2)),
    };
  };

  // Calcular
  const calcular = () => {
    const datos = obtenerCalculo();

    if (!datos) return;

    setResultado(datos.tallaBlancoCm);

    notify(t("notifications.calculated"), {
      type: "success",
    });
  };

  // Guardar
  const guardar = () => {
    if (!periodo || !zona.trim()) {
      notify(t("notifications.required"), {
        type: "warning",
      });

      return;
    }

    const datos = obtenerCalculo();

    if (!datos) return;

    const registro = {
      sexo,
      periodo,
      zona,
      alturaPadre: Number(alturaPadre),
      unidadPadre,
      alturaMadre: Number(alturaMadre),
      unidadMadre,
      ...datos,
    };

    create(
      "tallablanca",
      { data: registro },
      {
        onSuccess: () => {
          setResultado(datos.tallaBlancoCm);

          notify(t("notifications.saved"), {
            type: "success",
          });
        },

        onError: () => {
          notify(t("notifications.error"), {
            type: "error",
          });
        },
      }
    );
  };

  // Estilos que responden al tema
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
      className="talla-page"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Title title={t("tallablanca.title")} />

      <Card
        className="talla-card"
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <CardContent>
          {/* ENCABEZADO */}

          <Box className="talla-header">
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                className="talla-title"
              >
                {t("tallablanca.title")}
              </Typography>

              <Typography
                className="talla-subtitle"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                }}
              >
                014121305
              </Typography>
            </Box>

            <Box
              className="talla-mascota"
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
              {/* INSTRUCCIONES */}

              <Typography
                className="talla-section"
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
                {t("tallablanca.description")}
              </Typography>

              {/* SEXO */}

              <Typography
                className="talla-label"
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

              {/* ALTURA DEL PADRE */}

              <Typography
                className="talla-label"
                sx={{ color: labelColor }}
              >
                ☆ {t("tallablanca.fatherHeight")}
              </Typography>

              <Box className="talla-measure-row">
                <TextField
                  select
                  size="small"
                  label={t("common.unit")}
                  value={unidadPadre}
                  onChange={(e) => {
                    setUnidadPadre(e.target.value as Unidad);
                    setResultado(null);
                  }}
                  sx={{
                    ...inputStyle,
                    minWidth: 115,
                  }}
                >
                  <MenuItem value="cm">cm</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                  <MenuItem value="in">in</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  label={t("common.quantity")}
                  placeholder="175"
                  value={alturaPadre}
                  onChange={(e) => {
                    setAlturaPadre(e.target.value);
                    setResultado(null);
                  }}
                  sx={inputStyle}
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: "any",
                    },
                  }}
                />
              </Box>

              {/* ALTURA DE LA MADRE */}

              <Typography
                className="talla-label"
                sx={{ color: labelColor }}
              >
                ☆ {t("tallablanca.motherHeight")}
              </Typography>

              <Box className="talla-measure-row">
                <TextField
                  select
                  size="small"
                  label={t("common.unit")}
                  value={unidadMadre}
                  onChange={(e) => {
                    setUnidadMadre(e.target.value as Unidad);
                    setResultado(null);
                  }}
                  sx={{
                    ...inputStyle,
                    minWidth: 115,
                  }}
                >
                  <MenuItem value="cm">cm</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                  <MenuItem value="in">in</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  label={t("common.quantity")}
                  placeholder="160"
                  value={alturaMadre}
                  onChange={(e) => {
                    setAlturaMadre(e.target.value);
                    setResultado(null);
                  }}
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
                className="talla-section"
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
                onChange={(e) => setPeriodo(e.target.value)}
                sx={{ ...inputStyle, mb: 3 }}
              >
                <MenuItem value="2026-1">2026-1</MenuItem>
                <MenuItem value="2026-2">2026-2</MenuItem>
                <MenuItem value="2027-1">2027-1</MenuItem>
              </TextField>

              {/* ZONA */}

              <Typography
                className="talla-section"
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
                onChange={(e) => setZona(e.target.value)}
                sx={inputStyle}
              />
            </Grid>
          </Grid>

          {/* RESULTADO */}

          {resultado !== null && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography fontWeight="bold">
                {t("tallablanca.result")}:{" "}
                {resultado.toFixed(2)} cm
              </Typography>
            </Alert>
          )}

          {/* BOTONES */}

          <Box className="talla-actions">
            <Button
              variant="outlined"
              startIcon={<Calculate />}
              onClick={calcular}
            >
              {t("common.calculate")}
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={guardar}
              disabled={isPending}
              className="talla-guardar"
            >
              {t("common.save")}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
