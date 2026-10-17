
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
} from "react-admin";

import "./PerimetroCefalico.css";

type Sexo = "niño" | "niña";

export const PerimetroCefalico = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const notify = useNotify();
  const [create, { isPending }] = useCreate();

  const [sexo, setSexo] = useState<Sexo>("niño");
  const [periodo, setPeriodo] = useState("");
  const [zona, setZona] = useState("");

  const [unidad, setUnidad] = useState("cm");
  const [cantidad, setCantidad] = useState("");

  const [resultado, setResultado] = useState<number | null>(null);

  // Convertir la medida a centímetros
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

  const calcular = () => {
    const valor = Number(cantidad);

    if (
      cantidad.trim() === "" ||
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      notify("Ingresa una medida válida", {
        type: "warning",
      });
      return;
    }

    const medidaCm = convertirACm(valor, unidad);

    setResultado(Number(medidaCm.toFixed(2)));

    notify("Medida calculada correctamente", {
      type: "success",
    });
  };

  const guardar = () => {
    if (!periodo || !zona.trim()) {
      notify("Completa el periodo y la zona", {
        type: "warning",
      });
      return;
    }

    const valor = Number(cantidad);

    if (
      cantidad.trim() === "" ||
      !Number.isFinite(valor) ||
      valor <= 0
    ) {
      notify("Ingresa una medida válida", {
        type: "warning",
      });
      return;
    }

    const medidaCm = Number(
      convertirACm(valor, unidad).toFixed(2)
    );

    const registro = {
      sexo,
      periodo,
      zona,
      perimetro: valor,
      unidad,
      perimetroCm: medidaCm,
    };

    create(
      "perimetrocefalico",
      { data: registro },
      {
        onSuccess: () => {
          setResultado(medidaCm);

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
      className="perimetro-page"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Title title="Calculadora Perímetro Cefálico" />

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
                Calculadora perímetro cefálico
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
                Instrucciones
              </Typography>

              <Typography
                variant="body2"
                sx={{ mb: 2 }}
              >
                Selecciona el sexo del niño o niña
                e ingresa la medida del perímetro
                cefálico para registrar el resultado.
              </Typography>

              {/* SEXO */}

              <Typography
                className="perimetro-label"
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

              {/* PERÍMETRO */}

              <Typography
                className="perimetro-label"
                sx={{
                  color: isDark
                    ? "#e9ff75"
                    : "#748c1f",
                }}
              >
                ☆ Perímetro
              </Typography>

              <Box className="perimetro-measure-row">
                <TextField
                  select
                  label="Unidad"
                  value={unidad}
                  onChange={(e) => {
                    setUnidad(e.target.value);
                    setResultado(null);
                  }}
                  sx={{ minWidth: 115 }}
                  size="small"
                >
                  <MenuItem value="cm">cm</MenuItem>
                  <MenuItem value="mm">mm</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                  <MenuItem value="in">pulgadas</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  label="Cantidad"
                  placeholder="Ej. 45.5"
                  value={cantidad}
                  onChange={(e) => {
                    setCantidad(e.target.value);
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
                className="perimetro-section"
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
                className="perimetro-section"
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
                Perímetro cefálico:
                {" "}{resultado.toFixed(2)} cm
              </Typography>
            </Alert>
          )}

          {/* BOTONES */}

          <Box className="perimetro-actions">
            <Button
              variant="outlined"
              onClick={calcular}
            >
              Convertir
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={guardar}
              disabled={isPending}
              className="perimetro-guardar"
            >
              Guardar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
