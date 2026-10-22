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
import { SelectorRegion } from "../SelectorRegion";

type Sexo = "niño" | "niña";

type Nivel = "success" | "warning" | "error";

type Evaluacion = {
  edadMeses: number;
  z: number;
  percentil: number;
  categoria: string;
  nivel: Nivel;
  mediana: number;
};

type Resultado = {
  cm: number;
  evaluacion: Evaluacion | null; // null = fuera de 0–36 meses
};

/* ------------------------------------------------------------------ */
/*  Perímetro cefálico para la edad — CDC Growth Charts, 0–36 meses    */
/*  Fuente: tabla oficial de percentiles de CDC (hcageinf)             */
/*  Columnas: [edad en meses, P3, P5, P10, P25, P50, P75, P90, P95, P97] */
/* ------------------------------------------------------------------ */

const TABLA_PC: Record<Sexo, number[][]> = {
  niño: [
    [0.0, 31.48762, 32.14881, 33.08389, 34.46952, 35.81367, 37.00426, 37.97379, 38.51574, 38.85417],
    [0.5, 33.25006, 33.83392, 34.67253, 35.93987, 37.19361, 38.32125, 39.24989, 39.77262, 40.10028],
    [1.5, 35.78126, 36.26428, 36.97377, 38.07878, 39.20743, 40.24987, 41.12605, 41.62581, 41.94138],
    [2.5, 37.5588, 37.97959, 38.60724, 39.60637, 40.65233, 41.63968, 42.48436, 42.97189, 43.28181],
    [3.5, 38.89944, 39.27893, 39.85123, 40.77713, 41.76517, 42.71455, 43.53902, 44.01984, 44.32733],
    [4.5, 39.95673, 40.30766, 40.84114, 41.71483, 42.66116, 43.58358, 44.39472, 44.87197, 45.17877],
    [5.5, 40.81642, 41.14714, 41.65291, 42.48889, 43.40489, 44.30801, 45.11034, 45.58593, 45.893],
    [6.5, 41.53109, 41.84742, 42.3333, 43.14204, 44.0361, 44.92555, 45.72225, 46.19736, 46.50524],
    [7.5, 42.13521, 42.44134, 42.91311, 43.70245, 44.58097, 45.46104, 46.25443, 46.72983, 47.0388],
    [8.5, 42.65253, 42.95162, 43.41365, 44.18964, 45.05761, 45.93166, 46.72349, 47.1997, 47.5099],
    [9.5, 43.10009, 43.39458, 43.85025, 44.61764, 45.47908, 46.34979, 47.14142, 47.6188, 47.93027],
    [10.5, 43.49049, 43.7823, 44.23432, 44.99694, 45.85506, 46.72463, 47.51714, 47.99592, 48.30867],
    [11.5, 43.83332, 44.12399, 44.57454, 45.33549, 46.19295, 47.06318, 47.85744, 48.33781, 48.65181],
    [12.5, 44.136, 44.42679, 44.87767, 45.63952, 46.49853, 47.37091, 48.16763, 48.64972, 48.96494],
    [13.5, 44.40441, 44.69639, 45.14908, 45.91398, 46.77638, 47.65214, 48.45191, 48.93584, 49.25225],
    [14.5, 44.64328, 44.93733, 45.3931, 46.16284, 47.03018, 47.91038, 48.71371, 49.19955, 49.51712],
    [15.5, 44.85646, 45.15333, 45.61325, 46.38937, 47.26295, 48.14848, 48.95578, 49.44362, 49.76233],
    [16.5, 45.04712, 45.34746, 45.81245, 46.59626, 47.47721, 48.36881, 49.18045, 49.67034, 49.99018],
    [17.5, 45.2179, 45.52229, 45.99315, 46.78578, 47.67504, 48.57336, 49.38963, 49.88166, 50.20261],
    [18.5, 45.37104, 45.67997, 46.15739, 46.95981, 47.85821, 48.76379, 49.58497, 50.07919, 50.40125],
    [19.5, 45.50843, 45.82234, 46.30692, 47.11999, 48.02822, 48.94153, 49.76786, 50.26432, 50.58751],
    [20.5, 45.63169, 45.95096, 46.44325, 47.26769, 48.18637, 49.10781, 49.93948, 50.43825, 50.76259],
    [21.5, 45.74221, 46.06719, 46.56767, 47.40413, 48.33377, 49.2637, 50.10089, 50.60203, 50.92752],
    [22.5, 45.84121, 46.17221, 46.68129, 47.53035, 48.4714, 49.4101, 50.25298, 50.75654, 51.08322],
    [23.5, 45.92974, 46.26704, 46.78511, 47.64724, 48.60011, 49.54784, 50.39655, 50.90258, 51.23047],
    [24.5, 46.00872, 46.35259, 46.87997, 47.75563, 48.72065, 49.67762, 50.53229, 51.04085, 51.36998],
    [25.5, 46.07898, 46.42963, 46.96663, 47.85621, 48.83367, 49.80008, 50.66082, 51.17196, 51.50236],
    [26.5, 46.14124, 46.49889, 47.04578, 47.94962, 48.93976, 49.91578, 50.78269, 51.29647, 51.62817],
    [27.5, 46.19614, 46.56098, 47.11801, 48.0364, 49.03945, 50.02521, 50.89839, 51.41485, 51.7479],
    [28.5, 46.24425, 46.61646, 47.18385, 48.11707, 49.13321, 50.12883, 51.00836, 51.52756, 51.86198],
    [29.5, 46.2861, 46.66583, 47.24379, 48.19206, 49.22146, 50.22705, 51.113, 51.63499, 51.97081],
    [30.5, 46.32214, 46.70954, 47.29824, 48.26178, 49.30458, 50.32023, 51.21268, 51.73749, 52.07475],
    [31.5, 46.3528, 46.74801, 47.34761, 48.3266, 49.38292, 50.40869, 51.3077, 51.83539, 52.17413],
    [32.5, 46.37844, 46.78159, 47.39225, 48.38684, 49.45678, 50.49275, 51.39837, 51.92898, 52.26923],
    [33.5, 46.39942, 46.81061, 47.43247, 48.44281, 49.52645, 50.57267, 51.48496, 52.01853, 52.36032],
    [34.5, 46.41605, 46.8354, 47.46857, 48.49479, 49.59218, 50.6487, 51.56771, 52.10429, 52.44764],
    [35.5, 46.4286, 46.85621, 47.50081, 48.54301, 49.65423, 50.72108, 51.64686, 52.18646, 52.53143],
    [36.0, 46.43344, 46.86521, 47.51556, 48.56578, 49.68394, 50.75597, 51.68514, 52.22628, 52.57205],
  ],
  niña: [
    [0.0, 31.9302, 32.2509, 32.75949, 33.65187, 34.71156, 35.85124, 36.9535, 37.65138, 38.1211],
    [0.5, 33.38071, 33.68744, 34.17346, 35.02508, 36.03454, 37.11807, 38.16405, 38.82535, 39.27006],
    [1.5, 35.48627, 35.7756, 36.23326, 37.03282, 37.97672, 38.98533, 39.95459, 40.56517, 40.97482],
    [2.5, 36.9855, 37.26522, 37.70685, 38.47603, 39.38013, 40.34145, 41.26063, 41.83732, 42.22321],
    [3.5, 38.13114, 38.40561, 38.83814, 39.58905, 40.46774, 41.39732, 42.28153, 42.83396, 43.2026],
    [4.5, 39.04619, 39.31814, 39.74588, 40.48611, 41.34841, 42.25604, 43.11489, 43.64924, 44.00486],
    [5.5, 39.7996, 40.07086, 40.49672, 41.23136, 42.08335, 42.97566, 43.81575, 44.3363, 44.68183],
    [6.5, 40.43379, 40.70567, 41.13171, 41.86435, 42.71034, 43.59207, 44.41815, 44.92803, 45.26563],
    [7.5, 40.97672, 41.25016, 41.67787, 42.41113, 43.25429, 44.12897, 44.94461, 45.44619, 45.77751],
    [8.5, 41.44768, 41.7234, 42.15391, 42.88978, 43.7325, 44.60282, 45.41078, 45.90591, 46.23224],
    [9.5, 41.86058, 42.13913, 42.5733, 43.31329, 44.15743, 45.0255, 45.82799, 46.31815, 46.64053],
    [10.5, 42.22575, 42.50755, 42.94604, 43.69135, 44.53837, 45.40587, 46.20466, 46.69106, 47.01035],
    [11.5, 42.55105, 42.83643, 43.27977, 44.03133, 44.88241, 45.75072, 46.54726, 47.0309, 47.3478],
    [12.5, 42.8426, 43.13182, 43.58043, 44.33899, 45.19508, 46.06532, 46.86084, 47.34255, 47.65766],
    [13.5, 43.10526, 43.39853, 43.85274, 44.61891, 45.48078, 46.3539, 47.14942, 47.62991, 47.94373],
    [14.5, 43.34294, 43.64042, 44.1005, 44.87476, 45.74308, 46.61986, 47.41624, 47.89613, 48.20911],
    [15.5, 43.55883, 43.86066, 44.32682, 45.10959, 45.98487, 46.86599, 47.66399, 48.1438, 48.4563],
    [16.5, 43.75558, 44.06186, 44.53428, 45.32587, 46.20858, 47.0946, 47.89487, 48.37505, 48.68741],
    [17.5, 43.93539, 44.2462, 44.72501, 45.5257, 46.41622, 47.30765, 48.11074, 48.5917, 48.90419],
    [18.5, 44.10013, 44.41553, 44.90085, 45.71086, 46.6095, 47.50676, 48.31317, 48.79526, 49.10814],
    [19.5, 44.25137, 44.57142, 45.06333, 45.88284, 46.78989, 47.69335, 48.50351, 48.98703, 49.30052],
    [20.5, 44.39047, 44.71521, 45.21378, 46.04295, 46.95863, 47.86861, 48.6829, 49.16814, 49.48244],
    [21.5, 44.51861, 44.84806, 45.35334, 46.19229, 47.11681, 48.0336, 48.85236, 49.33955, 49.65484],
    [22.5, 44.6368, 44.97099, 45.48301, 46.33184, 47.26538, 48.18923, 49.01276, 49.50211, 49.81854],
    [23.5, 44.74593, 45.08487, 45.60367, 46.46246, 47.40516, 48.33629, 49.16486, 49.65657, 49.97429],
    [24.5, 44.84678, 45.19047, 45.71608, 46.58489, 47.53688, 48.47548, 49.30933, 49.80358, 50.12271],
    [25.5, 44.94005, 45.2885, 45.82092, 46.6998, 47.66118, 48.60743, 49.44677, 49.94373, 50.26437],
    [26.5, 45.02634, 45.37954, 45.91878, 46.80778, 47.77865, 48.7327, 49.57773, 50.07751, 50.39978],
    [27.5, 45.1062, 45.46415, 46.01021, 46.90935, 47.88979, 48.85178, 49.70266, 50.20541, 50.5294],
    [28.5, 45.18011, 45.5428, 46.09568, 47.00499, 47.99506, 48.9651, 49.822, 50.32783, 50.65362],
    [29.5, 45.24852, 45.61594, 46.17562, 47.09511, 48.09488, 49.07308, 49.93613, 50.44514, 50.77281],
    [30.5, 45.31181, 45.68394, 46.25043, 47.18009, 48.18961, 49.17607, 50.0454, 50.55769, 50.88731],
    [31.5, 45.37035, 45.74718, 46.32044, 47.2603, 48.2796, 49.2744, 50.15012, 50.66578, 50.99741],
    [32.5, 45.42444, 45.80596, 46.38599, 47.33603, 48.36515, 49.36836, 50.25058, 50.76968, 51.10338],
    [33.5, 45.4744, 45.86058, 46.44736, 47.40757, 48.44654, 49.45823, 50.34704, 50.86965, 51.20547],
    [34.5, 45.52047, 45.9113, 46.50481, 47.47518, 48.52402, 49.54425, 50.43974, 50.96593, 51.30392],
    [35.5, 45.56291, 45.95837, 46.55859, 47.53911, 48.59783, 49.62665, 50.52889, 51.05872, 51.39892],
    [36.0, 45.58284, 45.98061, 46.58417, 47.56976, 48.63342, 49.66656, 50.5722, 51.10387, 51.44519],
  ],
};

// z de cada percentil de la tabla (P3, P5, P10, P25, P50, P75, P90, P95, P97)
const Z_PERCENTILES = [
  -1.8808, -1.6449, -1.2816, -0.6745, 0, 0.6745, 1.2816, 1.6449, 1.8808,
];

// Edad en meses con decimales (usa días, importante en lactantes)
const edadEnMeses = (fechaISO: string): number => {
  const nacimiento = new Date(fechaISO + "T00:00:00");
  return (Date.now() - nacimiento.getTime()) / 86400000 / 30.4375;
};

// Curva de percentiles (en cm) interpolada a la edad exacta
const curvaPorEdad = (sexo: Sexo, meses: number): number[] | null => {
  const filas = TABLA_PC[sexo];
  if (meses < filas[0][0] || meses > filas[filas.length - 1][0]) return null;

  const i = filas.findIndex((f) => f[0] >= meses);
  if (i === 0 || filas[i][0] === meses) return filas[i].slice(1);

  const a = filas[i - 1];
  const b = filas[i];
  const w = (meses - a[0]) / (b[0] - a[0]);

  return a.slice(1).map((v, j) => v + w * (b[j + 1] - v));
};

// z-score del valor interpolando entre las curvas de percentil de CDC
// (fuera de P3–P97 se extrapola con la pendiente de las curvas externas)
const zDesdeCurva = (valor: number, curva: number[]): number => {
  const n = curva.length;

  if (valor <= curva[0]) {
    const pendiente =
      (Z_PERCENTILES[2] - Z_PERCENTILES[0]) / (curva[2] - curva[0]);
    return Z_PERCENTILES[0] + (valor - curva[0]) * pendiente;
  }

  if (valor >= curva[n - 1]) {
    const pendiente =
      (Z_PERCENTILES[n - 1] - Z_PERCENTILES[n - 3]) /
      (curva[n - 1] - curva[n - 3]);
    return Z_PERCENTILES[n - 1] + (valor - curva[n - 1]) * pendiente;
  }

  const i = curva.findIndex((c) => c > valor) - 1;
  const w = (valor - curva[i]) / (curva[i + 1] - curva[i]);
  return Z_PERCENTILES[i] + w * (Z_PERCENTILES[i + 1] - Z_PERCENTILES[i]);
};

// Distribución normal acumulada
const cdfNormal = (z: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
};

// Categoría por z-score (ajusta aquí los puntos de corte si hace falta)
const clasificarPC = (z: number): { categoria: string; nivel: Nivel } => {
  if (z < -3) return { categoria: "Microcefalia severa", nivel: "error" };
  if (z < -2) return { categoria: "Microcefalia", nivel: "warning" };
  if (z > 3) return { categoria: "Macrocefalia severa", nivel: "error" };
  if (z > 2) return { categoria: "Macrocefalia", nivel: "warning" };
  return { categoria: "Perímetro cefálico normal", nivel: "success" };
};

const evaluarPC = (
  sexo: Sexo,
  fechaNacimiento: string,
  pcCm: number
): Evaluacion | null => {
  const edadMeses = edadEnMeses(fechaNacimiento);
  const curva = curvaPorEdad(sexo, edadMeses);

  if (!curva) return null;

  const z = zDesdeCurva(pcCm, curva);
  const { categoria, nivel } = clasificarPC(z);

  return {
    edadMeses,
    z,
    percentil: cdfNormal(z) * 100,
    categoria,
    nivel,
    mediana: curva[4],
  };
};

/* ------------------------------------------------------------------ */

//Pantalla de perímetro cefálico (la medida alrededor de la cabeza)
export const PerimetroCefalico = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Traducciones (fallback opcional si falta la clave)
  const translate = useTranslate();
  const t = (key: string, fallback?: string) =>
    translate(`custom.${key}`, fallback ? { _: fallback } : undefined);

  //Para mostrar avisos y guardar en la base de datos
  const notify = useNotify();
  const [create, { isPending }] = useCreate();

  // Estados
  const [sexo, setSexo] = useState<Sexo>("niño");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [zona, setZona] = useState("");
  const [region, setRegion] = useState("");
  const [paciente, setPaciente] = useState("");

  const [unidad, setUnidad] = useState("cm");
  const [cantidad, setCantidad] = useState("");

  const [resultado, setResultado] = useState<Resultado | null>(null);

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

  // Validar fecha de nacimiento
  const fechaValida = (): boolean => {
    const nacimiento = new Date(fechaNacimiento + "T00:00:00");

    if (
      !fechaNacimiento ||
      Number.isNaN(nacimiento.getTime()) ||
      nacimiento > new Date()
    ) {
      notify(t("notifications.invalidDate"), {
        type: "warning",
      });
      return false;
    }

    return true;
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

    const cm = Number(convertirACm(valor, unidad).toFixed(2));

    // Rango imposible para un perímetro cefálico: casi seguro error de captura
    if (cm < 20 || cm > 70) {
      notify(t("notifications.invalidMeasurement"), {
        type: "warning",
      });
      return null;
    }

    return cm;
  };

  // Arma el resultado (medida en cm + evaluación CDC)
  const construirResultado = (medidaCm: number): Resultado => ({
    cm: medidaCm,
    evaluacion: evaluarPC(sexo, fechaNacimiento, medidaCm),
  });

  // Convertir y evaluar
  const calcular = () => {
    if (!fechaValida()) return;

    const medidaCm = obtenerMedida();

    if (medidaCm === null) return;

    setResultado(construirResultado(medidaCm));

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

    if (!fechaValida()) return;

    const medidaCm = obtenerMedida();

    if (medidaCm === null) return;

    //Datos que se mandan a la base de datos
    const registro = {
      region,
      paciente,
      sexo,
      fechaNacimiento,
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
          setResultado(construirResultado(medidaCm));

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

  const evaluacion = resultado?.evaluacion ?? null;

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
              {/* INSTRUCCIONES */}
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

              {/* FECHA DE NACIMIENTO */}

              <Typography
                className="perimetro-label"
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
                sx={{ ...inputStyle, mb: 3 }}
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

              {/* REGION */}

              <SelectorRegion
                value={region}
                onChange={setRegion}
                className="perimetro-section"
                inputSx={{ ...inputStyle, mb: 3 }}
              />

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
              severity={evaluacion ? evaluacion.nivel : "info"}
              sx={{ mt: 3 }}
            >
              <Typography fontWeight="bold">
                {t("perimetrocefalico.result")}:{" "}
                {resultado.cm.toFixed(2)} cm
              </Typography>

              {evaluacion ? (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {`${t("perimetrocefalico.percentile", "Percentil")} ${evaluacion.percentil.toFixed(
                    1
                  )} (z = ${evaluacion.z.toFixed(2)}) · ${
                    evaluacion.categoria
                  } · ${t("perimetrocefalico.median", "Mediana")}: ${evaluacion.mediana.toFixed(
                    1
                  )} cm`}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {t(
                    "perimetrocefalico.outOfRange",
                    "Fuera del rango de las tablas CDC de perímetro cefálico (0 a 36 meses)."
                  )}
                </Typography>
              )}
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
