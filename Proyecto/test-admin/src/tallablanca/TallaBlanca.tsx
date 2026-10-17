
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
} from "react-admin";

import "./TallaBlanca.css";

type Sexo = "niño" | "niña";

export const TallaBlanca = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const notify = useNotify();
  const [create, { isPending }] = useCreate();

  const [sexo, setSexo] = useState<Sexo>("niño");
  const [periodo, setPeriodo] = useState("");
  const [zona, setZona] = useState("");

  const [alturaPadre, setAlturaPadre] = useState("");
  const [unidadPadre, setUnidadPadre] = useState("cm");

  const [alturaMadre, setAlturaMadre] = useState("");
  const [unidadMadre, setUnidadMadre] = useState("cm");

  const [resultado, setResultado] = useState<number | null>(null);

  const convertirACm = (
    altura: number,
    unidad: string
  ) => {
    return unidad === "m" ? altura * 100 : altura;
  };

  const calcularTalla = () => {
    if (!alturaPadre || !alturaMadre) {
      notify("Ingresa las alturas de ambos padres", {
        type: "warning",
      });
      return;
    }

    const padre = convertirACm(
      Number(alturaPadre),
      unidadPadre
    );

    const madre = convertirACm(
      Number(alturaMadre),
      unidadMadre
    );

    if (
      !Number.isFinite(padre) ||
      !Number.isFinite(madre) ||
      padre <= 0 ||
      madre <= 0
    ) {
      notify("Las alturas deben ser números positivos", {
        type: "warning",
      });
      return;
    }

    // Fórmula de talla blanco familiar
    const talla =
      sexo === "niño"
        ? (padre + madre + 13) / 2
        : (padre + madre - 13) / 2;

    setResultado(Number(talla.toFixed(2)));

    notify("Cálculo realizado correctamente", {
      type: "success",
    });
  };

  const guardar = () => {
    if (resultado === null) {
      notify("Primero calcula la talla blanco", {
        type: "warning",
      });
      return;
    }

    const registro = {
      sexo,
      periodo,
      zona,
      alturaPadre: Number(alturaPadre),
      unidadPadre,
      alturaMadre: Number(alturaMadre),
      unidadMadre,
      tallaBlanco: resultado,
    };

    create(
      "tallablanca",
      { data: registro },
      {
        onSuccess: () => {
          notify("Registro guardado correctamente", {
            type: "success",
          });
        },
        onError: () => {
          notify("Error al guardar el registro", {
            type: "error",
          });
        },
      }
    );
  };

  return (
    <Box
      className="talla-page"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Title title="Calculadora Talla Blanco" />

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
                Calculadora talla blanco
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
              }}
            >
              <ChildCare sx={{ fontSize: 45 }} />
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* COLUMNA IZQUIERDA */}

            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                className="talla-section"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                }}
              >
                Instrucciones
              </Typography>

              <Typography
                variant="body2"
                sx={{ mb: 2 }}
              >
                Selecciona el sexo e ingresa la altura
                del padre y de la madre para calcular
                la talla blanco familiar.
              </Typography>

              {/* SEXO */}

              <Typography
                className="talla-label"
                sx={{
                  color: isDark
                    ? "#e9ff75"
                    : "#748c1f",
                }}
              >
                ⚥ Sexo
              </Typography>

              <ToggleButtonGroup
                value={sexo}
                exclusive
                fullWidth
                onChange={(_, value) => {
                  if (value !== null) {
                    setSexo(value);
                    setResultado(null);
                  }
                }}
                sx={{ mb: 3 }}
              >
                <ToggleButton value="niño">
                  Niño
                  <Male
                    sx={{
                      ml: 1,
                      color: "#55cfff",
                    }}
                  />
                </ToggleButton>

                <ToggleButton value="niña">
                  Niña
                  <Female
                    sx={{
                      ml: 1,
                      color: "#ef7fa9",
                    }}
                  />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* ALTURA PADRE */}

              <Typography
                className="talla-label"
                sx={{
                  color: isDark
                    ? "#e9ff75"
                    : "#748c1f",
                }}
              >
                ☆ Altura padre
              </Typography>

              <Box className="talla-height-row">
                <Male
                  sx={{
                    fontSize: 38,
                    color: "#55cfff",
                  }}
                />

                <TextField
                  select
                  value={unidadPadre}
                  onChange={(e) => {
                    setUnidadPadre(e.target.value);
                    setResultado(null);
                  }}
                  sx={{ width: 100 }}
                  size="small"
                >
                  <MenuItem value="cm">cm</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  placeholder="Cantidad"
                  value={alturaPadre}
                  onChange={(e) => {
                    setAlturaPadre(e.target.value);
                    setResultado(null);
                  }}
                  size="small"
                  fullWidth
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: "any",
                    },
                  }}
                />
              </Box>

              {/* ALTURA MADRE */}

              <Typography
                className="talla-label"
                sx={{
                  color: isDark
                    ? "#e9ff75"
                    : "#748c1f",
                }}
              >
                ☆ Altura madre
              </Typography>

              <Box className="talla-height-row">
                <Female
                  sx={{
                    fontSize: 38,
                    color: "#ef7fa9",
                  }}
                />

                <TextField
                  select
                  value={unidadMadre}
                  onChange={(e) => {
                    setUnidadMadre(e.target.value);
                    setResultado(null);
                  }}
                  sx={{ width: 100 }}
                  size="small"
                >
                  <MenuItem value="cm">cm</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  placeholder="Cantidad"
                  value={alturaMadre}
                  onChange={(e) => {
                    setAlturaMadre(e.target.value);
                    setResultado(null);
                  }}
                  size="small"
                  fullWidth
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
              <Typography
                className="talla-section"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                }}
              >
                Periodo
              </Typography>

              <TextField
                select
                fullWidth
                size="small"
                value={periodo}
                onChange={(e) =>
                  setPeriodo(e.target.value)
                }
                sx={{ mb: 3 }}
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

              <Typography
                className="talla-section"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                }}
              >
                EBDI / Zona
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Ingresa la zona"
                value={zona}
                onChange={(e) =>
                  setZona(e.target.value)
                }
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
                Talla blanco familiar:
                {" "}{resultado.toFixed(2)} cm
              </Typography>

              <Typography variant="body2">
                Estimación orientativa de la
                estatura adulta.
              </Typography>
            </Alert>
          )}

          {/* BOTONES */}

          <Box className="talla-actions">
            <Button
              variant="outlined"
              startIcon={<Calculate />}
              onClick={calcularTalla}
            >
              Calcular
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={guardar}
              disabled={isPending}
              className="talla-guardar"
            >
              Guardar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
