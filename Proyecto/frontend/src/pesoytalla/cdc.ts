// Cálculo de estado nutricio con las tablas LMS de los CDC Growth Charts (2–20 años).
//
// Archivos requeridos en ./cdc/ (CSV oficiales de CDC, sin modificar):
//   statage.csv    -> Talla para la edad
//   wtstat.csv     -> Peso para la talla
//   bmiagerev.csv  -> IMC para la edad
import statageRaw from "./cdc/statage.csv?raw";
import wtstatRaw from "./cdc/wtstat.csv?raw";
import bmiagerevRaw from "./cdc/bmiagerev.csv?raw";

export type SexoCDC = "niño" | "niña";
export type Nivel = "success" | "info" | "warning" | "error";

export type Fila = {
  x: number; // edad en meses (statage, bmiagerev) o talla en cm (wtstat)
  L: number;
  M: number;
  S: number;
  pct: Record<string, number>; // p3, p5, p10, ... p97 (suavizados por CDC)
};

export type TablaCDC = Record<1 | 2, Fila[]>; // 1 = niño, 2 = niña

export type TablasCDC = {
  tallaEdad: TablaCDC;
  pesoTalla: TablaCDC;
  imcEdad: TablaCDC;
};

type ParametrosLMS = {
  L: number;
  M: number;
  S: number;
  pct: Record<string, number>;
};

export type Indicador = {
  valor: number;
  z: number;
  percentil: number;
  categoria: string;
  nivel: Nivel;
  referencia: number | null; // mediana (P50) de referencia
};

export type Evaluacion = {
  edadMeses: number;
  alturaCm: number;
  pesoKg: number;
  imc: number;
  fueraDeRango: boolean; // fuera de 2–20 años
  tallaEdad: Indicador | null;
  pesoTalla: Indicador | null;
  imcEdad: Indicador | null;
};

export const codigoSexo = (sexo: SexoCDC): 1 | 2 => (sexo === "niño" ? 1 : 2);

/* ---------- Lectura de CSV ---------- */

const parsearCsv = (crudo: string, clavesX: string[]): TablaCDC => {
  const tabla: TablaCDC = { 1: [], 2: [] };

  const lineas = crudo
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lineas.length < 2) return tabla;

  const cab = lineas[0]
    .split(",")
    .map((c) => c.trim().replace(/"/g, "").toLowerCase());

  const iSexo = cab.indexOf("sex");
  const iX = cab.findIndex((c) => clavesX.includes(c));
  const iL = cab.indexOf("l");
  const iM = cab.indexOf("m");
  const iS = cab.indexOf("s");

  if ([iSexo, iX, iL, iM, iS].some((i) => i < 0)) return tabla;

  for (const linea of lineas.slice(1)) {
    const celdas = linea.split(",").map((c) => Number(c.trim()));
    const sexo = celdas[iSexo];
    if (sexo !== 1 && sexo !== 2) continue;

    const x = celdas[iX];
    const L = celdas[iL];
    const M = celdas[iM];
    const S = celdas[iS];
    if (![x, L, M, S].every(Number.isFinite)) continue;

    const pct: Record<string, number> = {};
    cab.forEach((nombre, i) => {
      if (/^p\d+$/.test(nombre) && Number.isFinite(celdas[i])) {
        pct[nombre] = celdas[i];
      }
    });

    const clave: 1 | 2 = sexo === 1 ? 1 : 2;
    tabla[clave].push({ x, L, M, S, pct });
  }

  tabla[1].sort((a, b) => a.x - b.x);
  tabla[2].sort((a, b) => a.x - b.x);

  return tabla;
};

let cache: TablasCDC | null = null;

export const cargarTablasCDC = (): TablasCDC => {
  if (!cache) {
    cache = {
      tallaEdad: parsearCsv(statageRaw, ["agemos"]),
      pesoTalla: parsearCsv(wtstatRaw, ["height", "length", "stature"]),
      imcEdad: parsearCsv(bmiagerevRaw, ["agemos"]),
    };
  }
  return cache;
};

/* ---------- Matemática LMS ---------- */

// Interpolación lineal de L, M, S y percentiles entre filas contiguas
const interpolar = (filas: Fila[], x: number): ParametrosLMS | null => {
  const n = filas.length;
  if (n === 0 || x < filas[0].x || x > filas[n - 1].x) return null;

  const i = filas.findIndex((f) => f.x >= x);
  const b = filas[i];
  if (i === 0 || b.x === x) return b;

  const a = filas[i - 1];
  const w = (x - a.x) / (b.x - a.x);
  const mezcla = (p: number, q: number) => p + w * (q - p);

  const pct: Record<string, number> = {};
  for (const k of Object.keys(b.pct)) {
    if (k in a.pct) pct[k] = mezcla(a.pct[k], b.pct[k]);
  }

  return {
    L: mezcla(a.L, b.L),
    M: mezcla(a.M, b.M),
    S: mezcla(a.S, b.S),
    pct,
  };
};

// z = ((X/M)^L - 1) / (L·S)   (si L ≈ 0: ln(X/M) / S)
const zScore = (valor: number, { L, M, S }: ParametrosLMS) =>
  Math.abs(L) < 1e-9
    ? Math.log(valor / M) / S
    : (Math.pow(valor / M, L) - 1) / (L * S);

// Distribución normal acumulada (Abramowitz–Stegun 26.2.17, error < 1e-7)
const cdfNormal = (z: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
};

/* ---------- Categorías (ajusta aquí los puntos de corte) ---------- */

type Clasificacion = { categoria: string; nivel: Nivel };

// IMC para la edad (CDC): <P5, P5–<P85, P85–<P95, ≥P95 (y clases por % del P95)
const clasificarIMC = (
  p: number,
  valor: number,
  params: ParametrosLMS
): Clasificacion => {
  if (p < 5) return { categoria: "Bajo peso", nivel: "warning" };
  if (p < 85) return { categoria: "Peso saludable", nivel: "success" };
  if (p < 95) return { categoria: "Sobrepeso", nivel: "warning" };

  const p95 = params.pct.p95;
  const razon = p95 ? valor / p95 : 1;
  if (razon >= 1.4)
    return { categoria: "Obesidad severa (clase 3)", nivel: "error" };
  if (razon >= 1.2) return { categoria: "Obesidad clase 2", nivel: "error" };
  return { categoria: "Obesidad (clase 1)", nivel: "error" };
};

// Talla para la edad: <P3 baja, P3–P97 normal, >P97 alta
const clasificarTalla = (p: number): Clasificacion => {
  if (p < 3) return { categoria: "Talla baja", nivel: "warning" };
  if (p > 97) return { categoria: "Talla alta", nivel: "info" };
  return { categoria: "Talla normal", nivel: "success" };
};

// Peso para la talla: <P5 bajo, P5–<P85 adecuado, P85–<P95 riesgo, ≥P95 sobrepeso
const clasificarPesoTalla = (p: number): Clasificacion => {
  if (p < 5) return { categoria: "Bajo peso para la talla", nivel: "warning" };
  if (p < 85) return { categoria: "Peso adecuado para la talla", nivel: "success" };
  if (p < 95)
    return { categoria: "Riesgo de sobrepeso", nivel: "warning" };
  return { categoria: "Sobrepeso para la talla", nivel: "error" };
};

/* ---------- API pública ---------- */

export const edadEnMeses = (fechaISO: string, hoy: Date = new Date()) => {
  const nacimiento = new Date(fechaISO + "T00:00:00");
  return (hoy.getTime() - nacimiento.getTime()) / 86400000 / 30.4375;
};

const construirIndicador = (
  filas: Fila[],
  x: number,
  valor: number,
  clasificar: (
    p: number,
    valor: number,
    params: ParametrosLMS
  ) => Clasificacion
): Indicador | null => {
  const params = interpolar(filas, x);
  if (!params || !(valor > 0)) return null;

  const z = zScore(valor, params);
  const percentil = cdfNormal(z) * 100;
  const { categoria, nivel } = clasificar(percentil, valor, params);

  return {
    valor,
    z,
    percentil,
    categoria,
    nivel,
    referencia: params.pct.p50 ?? params.M,
  };
};

export const evaluarCrecimiento = (
  tablas: TablasCDC,
  sexo: SexoCDC,
  fechaNacimiento: string,
  alturaCm: number,
  pesoKg: number
): Evaluacion => {
  const k = codigoSexo(sexo);
  const edadMeses = edadEnMeses(fechaNacimiento);
  const imc = pesoKg / (alturaCm / 100) ** 2;

  return {
    edadMeses,
    alturaCm,
    pesoKg,
    imc,
    fueraDeRango: edadMeses < 24 || edadMeses > 240.5,
    tallaEdad: construirIndicador(
      tablas.tallaEdad[k],
      edadMeses,
      alturaCm,
      clasificarTalla
    ),
    imcEdad: construirIndicador(
      tablas.imcEdad[k],
      edadMeses,
      imc,
      clasificarIMC
    ),
    pesoTalla: construirIndicador(
      tablas.pesoTalla[k],
      alturaCm,
      pesoKg,
      clasificarPesoTalla
    ),
  };
};

export const severidadGeneral = (ev: Evaluacion | null): Nivel => {
  const niveles = [ev?.imcEdad, ev?.tallaEdad, ev?.pesoTalla].map(
    (i) => i?.nivel
  );
  if (niveles.includes("error")) return "error";
  if (niveles.includes("warning")) return "warning";
  return "success";
};
