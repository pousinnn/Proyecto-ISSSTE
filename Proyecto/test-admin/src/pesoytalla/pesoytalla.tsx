import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Grid,
  Divider,
  Alert,
} from "@mui/material";

import {
  ChildCare,
  Female,
  Male,
  Save,
  Calculate,
} from "@mui/icons-material";

import { Title, useNotify } from "react-admin";
import "./pesoytalla.css";

type Sexo = "niño" | "niña";

export const PesoYTalla = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const notify = useNotify();

  const [sexo, setSexo] = useState<Sexo>("niño");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [zona, setZona] = useState("");

  const [altura, setAltura] = useState("");
  const [unidadAltura, setUnidadAltura] = useState("cm");

  const [peso, setPeso] = useState("");
  const [unidadPeso, setUnidadPeso] = useState("kg");

  const [resultado, setResultado] = useState<{
    edad: string;
    imc: string;
  } | null>(null);

  const calcularEdad = (fecha: string): string => {
    if (!fecha) return "";

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

  const calcular = () => {
    if (!fechaNacimiento || !altura || !peso) {
      notify("Completa los campos obligatorios", {
        type: "warning",
      });
      return;
    }

    const nacimiento = new Date(fechaNacimiento + "T00:00:00");

    if (nacimiento > new Date()) {
      notify("La fecha de nacimiento no puede ser futura", {
        type: "warning",
      });
      return;
    }

    const alturaNumero = Number(altura);
    const pesoNumero = Number(peso);

    if (alturaNumero <= 0 || pesoNumero <= 0) {
      notify("La altura y el peso deben ser positivos", {
        type: "warning",
      });
      return;
    }

    const alturaMetros =
      unidadAltura === "cm"
        ? alturaNumero / 100
        : alturaNumero;

    const pesoKg =
      unidadPeso === "lb"
        ? pesoNumero * 0.45359237
        : pesoNumero;

    const imc = pesoKg / (alturaMetros * alturaMetros);

    setResultado({
      edad: calcularEdad(fechaNacimiento),
      imc: imc.toFixed(2),
    });
  };

  const guardar = () => {
    if (!resultado) {
      notify("Primero calcula los resultados", {
        type: "warning",
      });
      return;
    }

    // Aquí puedes conectar tu dataProvider
    const registro = {
      sexo,
      fechaNacimiento,
      periodo,
      zona,
      altura: Number(altura),
      unidadAltura,
      peso: Number(peso),
      unidadPeso,
      ...resultado,
    };

    console.log("Registro:", registro);

    notify("Datos preparados correctamente", {
      type: "success",
    });
  };

  return (
    <Box className="peso-page" sx={{
      backgroundColor: "background.default",
      color: "text.primary",
      minHeight: "100vh",
      p: 3,
    }}>
      <Title title="Calculadora Peso & Talla" />

      <Card className="peso-card" sx={{
        backgroundColor: "background.paper",
        color: "text.primary",
        borderRadius: 3,
        p: 2,
      }}>
        <CardContent>
          <Box className="peso-header">
            <Box>
              <Typography variant="h4" className="peso-title">
                Calculadora Peso & Talla
              </Typography>

              <Typography className="peso-subtitle">
                014121305
              </Typography>
            </Box>

            <Box className="peso-mascota">
              <ChildCare sx={{ fontSize: 45 }} />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography className="section-title">
                Instrucciones
              </Typography>

              <Typography variant="body2" sx={{ mb: 2 }}>
                Introduce los datos del niño o niña para
                calcular su edad y su índice de masa corporal.
              </Typography>

              <Typography className="field-label">
                Sexo
              </Typography>

              <ToggleButtonGroup
                value={sexo}
                exclusive
                onChange={(_, value) => {
                  if (value) setSexo(value);
                }}
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton value="niño">
                  <Male sx={{ mr: 1 }} />
                  Niño
                </ToggleButton>

                <ToggleButton value="niña">
                  <Female sx={{ mr: 1 }} />
                  Niña
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography className="field-label">
                Fecha de nacimiento
              </Typography>

              <TextField
                type="date"
                fullWidth
                value={fechaNacimiento}
                onChange={(e) => {
                  setFechaNacimiento(e.target.value);
                  setResultado(null);
                }}
                slotProps={{
                  htmlInput: {
                    max: new Date().toLocaleDateString("en-CA"),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography className="field-label">
                Periodo
              </Typography>

              <TextField
                select
                fullWidth
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                sx={{ mb: 3 }}
              >
                <MenuItem value="2026-1">2026-1</MenuItem>
                <MenuItem value="2026-2">2026-2</MenuItem>
                <MenuItem value="2027-1">2027-1</MenuItem>
              </TextField>

              <Typography className="field-label">
                EBDI / Zona
              </Typography>

              <TextField
                fullWidth
                placeholder="Ingresa la zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Typography className="field-label">
                ☆ Altura
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                <TextField
                  select
                  value={unidadAltura}
                  onChange={(e) => {
                    setUnidadAltura(e.target.value);
                    setResultado(null);
                  }}
                  sx={{ width: "35%" }}
                >
                  <MenuItem value="cm">cm</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  placeholder="Cantidad"
                  fullWidth
                  value={altura}
                  onChange={(e) => {
                    setAltura(e.target.value);
                    setResultado(null);
                  }}
                />
              </Box>

              <Typography className="field-label">
                ☆ Peso
              </Typography>

              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                <TextField
                  select
                  value={unidadPeso}
                  onChange={(e) => {
                    setUnidadPeso(e.target.value);
                    setResultado(null);
                  }}
                  sx={{ width: "35%" }}
                >
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="lb">lb</MenuItem>
                </TextField>

                <TextField
                  type="number"
                  placeholder="Cantidad"
                  fullWidth
                  value={peso}
                  onChange={(e) => {
                    setPeso(e.target.value);
                    setResultado(null);
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {resultado && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <Typography>
                Edad: {resultado.edad}
              </Typography>
              <Typography>
                IMC: {resultado.imc}
              </Typography>
            </Alert>
          )}

          <Box className="peso-actions">
            <Button
              variant="outlined"
              startIcon={<Calculate />}
              onClick={calcular}
            >
              Calcular
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={guardar}
              className="guardar-btn"
            >
              Guardar
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
