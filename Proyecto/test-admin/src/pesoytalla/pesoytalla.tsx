
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

import "./pesoytalla.css";
import { SelectorPaciente } from "../SelectorPaciente";

type Sexo = "niño" | "niña";

type Resultado = {
  edad: string;
  imc: number;
};

export const PesoYTalla = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Traducciones de React Admin
  const translate = useTranslate();

  const notify = useNotify();
  const [create, { isPending }] = useCreate();

  // Estados
  const [sexo, setSexo] = useState<Sexo>("niño");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [zona, setZona] = useState("");
  const [paciente, setPaciente] = useState("");

  const [altura, setAltura] = useState("");
  const [unidadAltura, setUnidadAltura] = useState("cm");

  const [peso, setPeso] = useState("");
  const [unidadPeso, setUnidadPeso] = useState("kg");

  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Traducción corta para reutilizar en JSX
  const t = (key: string) => translate(`custom.${key}`);

  // Calcular edad
  const calcularEdad = (fecha: string): string => {
    const nacimiento = new Date(fecha + "T00:00:00");
    const hoy = new Date();

    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();

    if (hoy.getDate() < nacimiento.getDate()) {
      meses--;
    }

    if (meses < 0) {
      años--;
      meses += 12;
    }

    return `${años} años y ${meses} meses`;
  };

  // Validar y convertir medidas
  const obtenerMedidas = () => {
    const nacimiento = new Date(
      fechaNacimiento + "T00:00:00"
    );

    if (
      !fechaNacimiento ||
      Number.isNaN(nacimiento.getTime()) ||
      nacimiento > new Date()
    ) {
      notify(t("notifications.invalidDate"), {
        type: "warning",
      });
      return null;
    }

    const alturaNumero = Number(altura);
    const pesoNumero = Number(peso);

    if (
      altura.trim() === "" ||
      peso.trim() === "" ||
      !Number.isFinite(alturaNumero) ||
      !Number.isFinite(pesoNumero) ||
      alturaNumero <= 0 ||
      pesoNumero <= 0
    ) {
      notify(t("notifications.invalidMeasurement"), {
        type: "warning",
      });
      return null;
    }

    const alturaMetros =
      unidadAltura === "cm"
        ? alturaNumero / 100
        : alturaNumero;

    const pesoKg =
      unidadPeso === "lb"
        ? pesoNumero * 0.45359237
        : pesoNumero;

    const imc = pesoKg / (alturaMetros ** 2);

    return {
      edad: calcularEdad(fechaNacimiento),
      imc: Number(imc.toFixed(2)),
      alturaCm: Number((alturaMetros * 100).toFixed(2)),
      pesoKg: Number(pesoKg.toFixed(2)),
    };
  };

  // Calcular IMC
  const calcular = () => {
    const datos = obtenerMedidas();

    if (!datos) return;

    setResultado({
      edad: datos.edad,
      imc: datos.imc,
    });

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

    const datos = obtenerMedidas();

    if (!datos) return;

    const registro = {
      paciente,
      sexo,
      fechaNacimiento,
      periodo,
      zona,
      altura: Number(altura),
      unidadAltura,
      peso: Number(peso),
      unidadPeso,
      ...datos,
    };

    create(
      "pesoytalla",
      { data: registro },
      {
        onSuccess: () => {
          setResultado({
            edad: datos.edad,
            imc: datos.imc,
          });

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

  // Colores dinámicos
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
      className="peso-page"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Title title={t("pesoytalla.title")} />

      <Card
        className="peso-card"
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <CardContent>
          {/* ENCABEZADO */}

          <Box className="peso-header">
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                className="peso-title"
              >
                {t("pesoytalla.title")}
              </Typography>

              <Typography
                className="peso-subtitle"
                sx={{
                  bgcolor: "action.hover",
                  color: "text.primary",
                }}
              >
                014121305
              </Typography>
            </Box>

            <Box
              className="peso-mascota"
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
                className="peso-section"
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
                {t("pesoytalla.description")}
              </Typography>

              {/* SEXO */}

              <Typography
                className="peso-label"
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

              {/* FECHA DE NACIMIENTO */}

              <Typography
                className="peso-label"
                sx={{ color: labelColor }}
              >
                ☆ {t("pesoytalla.birthdate")}
              </Typography>

              <TextField
                type="date"
                fullWidth
                size="small"
                value={fechaNacimiento}
                onChange={(e) => {
                  setFechaNacimiento(e.target.value);
                  setResultado(null);
                }}
                sx={inputStyle}
                slotProps={{
                  htmlInput: {
                    max: [
                      new Date().getFullYear(),
                      String(
                        new Date().getMonth() + 1
                      ).padStart(2, "0"),
                      String(
                        new Date().getDate()
                      ).padStart(2, "0"),
                    ].join("-"),
                  },
                }}
              />
            </Grid>

            {/* COLUMNA DERECHA */}

            <Grid size={{ xs: 12, md: 5 }}>
              <Typography
                className="peso-section"
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
                className="peso-section"
                inputSx={{ ...inputStyle, mb: 3 }}
              />

              {/* ZONA */}

              <Typography
                className="peso-section"
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
                sx={{ ...inputStyle, mb: 3 }}
              />

              {/* ALTURA */}

              <Typography
                className="peso-label"
                sx={{ color: labelColor }}
              >
                ☆ {t("pesoytalla.height")}
              </Typography>

              <Box className="peso-measure-row">
                <TextField
                  select
                  size="small"
                  value={unidadAltura}
                  onChange={(e) => {
                    setUnidadAltura(e.target.value);
                    setResultado(null);
                  }}
                  sx={{
                    ...inputStyle,
                    minWidth: 100,
                  }}
                >
                  <MenuItem value="cm">cm</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  placeholder={t("common.quantity")}
                  value={altura}
                  onChange={(e) => {
                    setAltura(e.target.value);
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

              {/* PESO */}

              <Typography
                className="peso-label"
                sx={{ color: labelColor }}
              >
                ☆ {t("pesoytalla.weight")}
              </Typography>

              <Box className="peso-measure-row">
                <TextField
                  select
                  size="small"
                  value={unidadPeso}
                  onChange={(e) => {
                    setUnidadPeso(e.target.value);
                    setResultado(null);
                  }}
                  sx={{
                    ...inputStyle,
                    minWidth: 100,
                  }}
                >
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="lb">lb</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  placeholder={t("common.quantity")}
                  value={peso}
                  onChange={(e) => {
                    setPeso(e.target.value);
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
          </Grid>

          {/* RESULTADOS */}

          {resultado !== null && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography fontWeight="bold">
                {t("pesoytalla.age")}: {resultado.edad}
              </Typography>

              <Typography fontWeight="bold">
                {t("pesoytalla.bmi")}:{" "}
                {resultado.imc.toFixed(2)} kg/m²
              </Typography>
            </Alert>
          )}

          {/* BOTONES */}

          <Box className="peso-actions">
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
              className="peso-guardar"
            >
              {t("common.save")}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
