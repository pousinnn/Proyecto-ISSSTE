import { useMemo, useState } from "react";

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
  usePermissions,
} from "react-admin";

import "./pesoytalla.css";
import { SelectorPaciente } from "../SelectorPaciente";
import { SelectorRegion } from "../SelectorRegion";
import { GraficaCrecimiento } from "./GraficaCrecimiento";
import {
  cargarTablasCDC,
  codigoSexo,
  evaluarCrecimiento,
  severidadGeneral,
  type Evaluacion,
  type Indicador,
} from "./cdc";

type Sexo = "niño" | "niña";

//Lo que se muestra al calcular
type Resultado = {
  edad: string;
  imc: number;
  evaluacion: Evaluacion | null;
};

//Pantalla de peso y talla del paciente
export const PesoYTalla = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Traducciones de React Admin
  const translate = useTranslate();
  //La estancia solo captura los datos, no usa las calculadoras
  const { permissions } = usePermissions();
  const soloCaptura = permissions === "estancia";

  //Para mostrar avisos y guardar en la base de datos
  const notify = useNotify();
  const [create, { isPending }] = useCreate();

  // Tablas CDC (se leen una sola vez)
  const tablas = useMemo(() => cargarTablasCDC(), []);

  // Estados
  const [sexo, setSexo] = useState<Sexo>("niño");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [zona, setZona] = useState("");
  const [region, setRegion] = useState("");
  const [paciente, setPaciente] = useState("");

  const [altura, setAltura] = useState("");
  const [unidadAltura, setUnidadAltura] = useState("cm");

  const [peso, setPeso] = useState("");
  const [unidadPeso, setUnidadPeso] = useState("kg");

  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Traducción corta para reutilizar en JSX (fallback opcional si falta la clave)
  const t = (key: string, fallback?: string) =>
    translate(`custom.${key}`, fallback ? { _: fallback } : undefined);

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

    //Revisa que la altura y el peso sean números válidos
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

    //Pasa la altura a metros y el peso a kg
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

  // Arma el resultado a mostrar (edad, IMC y evaluación CDC)
  const construirResultado = (datos: {
    edad: string;
    imc: number;
    alturaCm: number;
    pesoKg: number;
  }): Resultado => ({
    edad: datos.edad,
    imc: datos.imc,
    evaluacion: evaluarCrecimiento(
      tablas,
      sexo,
      fechaNacimiento,
      datos.alturaCm,
      datos.pesoKg
    ),
  });

  // Calcular IMC
  const calcular = () => {
    const datos = obtenerMedidas();

    if (!datos) return;

    setResultado(construirResultado(datos));

    notify(t("notifications.calculated"), {
      type: "success",
    });
  };

  // Guardar registro
  const guardar = () => {
    if (!periodo || !region || !zona.trim()) {
      notify(t("notifications.required"), {
        type: "warning",
      });
      return;
    }

    const datos = obtenerMedidas();

    if (!datos) return;

    //Datos que se mandan a la base de datos
    const registro = {
      region,
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
          setResultado(construirResultado(datos));

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

  // Línea de texto para un indicador CDC
  const lineaIndicador = (
    nombre: string,
    ind: Indicador | null,
    unidad: string
  ) => (
    <Typography variant="body2" sx={{ mt: 0.5 }}>
      <strong>{nombre}:</strong>{" "}
      {ind
        ? `${t("pesoytalla.percentile", "Percentil")} ${ind.percentil.toFixed(
            1
          )} (z = ${ind.z.toFixed(2)}) · ${ind.categoria}${
            ind.referencia !== null
              ? ` · ${t("pesoytalla.median", "Mediana")}: ${ind.referencia.toFixed(
                  1
                )} ${unidad}`
              : ""
          }`
        : t(
            "pesoytalla.outOfRange",
            "Fuera del rango de las tablas CDC"
          )}
    </Typography>
  );

  // Colores dinámicos
  const labelColor = isDark ? "#e9ff75" : "#748c1f";

  //Estilo de los campos de texto
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

  //Evaluación y sexo para las gráficas
  const evaluacion = resultado?.evaluacion ?? null;
  const k = codigoSexo(sexo);

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
              {/* INSTRUCCIONES */}
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
              {/* PERIODO */}
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

              {/* REGION */}

              <SelectorRegion
                value={region}
                onChange={setRegion}
                className="peso-section"
                inputSx={{ ...inputStyle, mb: 3 }}
              />

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

          {!soloCaptura && resultado !== null && (
            <Alert
              severity={severidadGeneral(evaluacion)}
              sx={{ mt: 3 }}
            >
              <Typography fontWeight="bold">
                {t("pesoytalla.age")}: {resultado.edad}
              </Typography>

              <Typography fontWeight="bold">
                {t("pesoytalla.bmi")}:{" "}
                {resultado.imc.toFixed(2)} kg/m²
              </Typography>

              {/* Percentiles del CDC (comparación con otros niños de su edad) */}
              {evaluacion && (
                <>
                  {lineaIndicador(
                    t("pesoytalla.bmiForAge", "IMC para la edad"),
                    evaluacion.imcEdad,
                    "kg/m²"
                  )}
                  {lineaIndicador(
                    t("pesoytalla.heightForAge", "Talla para la edad"),
                    evaluacion.tallaEdad,
                    "cm"
                  )}
                  {lineaIndicador(
                    t("pesoytalla.weightForHeight", "Peso para la talla"),
                    evaluacion.pesoTalla,
                    "kg"
                  )}

                  {evaluacion.fueraDeRango && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {t(
                        "pesoytalla.ageWarning",
                        "Las tablas CDC aplican de 2 a 20 años; para menores de 2 años se recomiendan las curvas OMS."
                      )}
                    </Typography>
                  )}
                </>
              )}
            </Alert>
          )}

          {/* GRÁFICAS */}

          {!soloCaptura && evaluacion && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <GraficaCrecimiento
                  titulo={t("pesoytalla.weightForHeight", "Peso para la talla")}
                  filas={tablas.pesoTalla[k]}
                  curvas={["p5", "p10", "p25", "p50", "p75", "p90", "p95"]}
                  etiquetaX="Talla (cm)"
                  etiquetaY="Peso (kg)"
                  punto={{ x: evaluacion.alturaCm, y: evaluacion.pesoKg }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <GraficaCrecimiento
                  titulo={t("pesoytalla.heightForAge", "Talla para la edad")}
                  filas={tablas.tallaEdad[k]}
                  curvas={["p3", "p10", "p25", "p50", "p75", "p90", "p97"]}
                  etiquetaX="Edad (años)"
                  etiquetaY="Talla (cm)"
                  xDivisor={12}
                  punto={{ x: evaluacion.edadMeses, y: evaluacion.alturaCm }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <GraficaCrecimiento
                  titulo={t("pesoytalla.bmiForAge", "IMC para la edad")}
                  filas={tablas.imcEdad[k]}
                  curvas={["p5", "p10", "p25", "p50", "p75", "p85", "p95"]}
                  etiquetaX="Edad (años)"
                  etiquetaY="IMC (kg/m²)"
                  xDivisor={12}
                  punto={{ x: evaluacion.edadMeses, y: evaluacion.imc }}
                />
              </Grid>
            </Grid>
          )}

          {/* BOTONES */}

          <Box className="peso-actions">
            {!soloCaptura && (
              <Button
                variant="outlined"
                startIcon={<Calculate />}
                onClick={calcular}
              >
                {t("common.calculate")}
              </Button>
            )}

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
