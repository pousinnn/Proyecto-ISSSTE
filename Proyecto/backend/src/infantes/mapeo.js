//Pasa los datos del padrón de MySQL a mongodb con los mismos nombres

//Columnas de cada mes y el mes al que son
export const COLUMNAS_MES = {
  inscripIniEne21: "2021-01",
  inscripIniFeb21: "2021-02",
  inscripIniMarzo21: "2021-03",
  inscripIniAbril21: "2021-04",
  inscripIniMayo21: "2021-05",
  inscripIniJunio21: "2021-06",
  inscripIniJulio21: "2021-07",
  inscripIniAgos21: "2021-08",
  inscripIniSep21: "2021-09",
  inscripIniOct21: "2021-10",
  inscripIniNov21: "2021-11",
  inscIniDic2021: "2021-12",

  inscIniEne2022: "2022-01",
  inscIniFeb2022: "2022-02",
  inscIniMarzo2022: "2022-03",
  inscIniAbril2022: "2022-04",
  inscIniMayo2022: "2022-05",
  inscIniJunio2022: "2022-06",
  inscIniJulio2022: "2022-07",
  inscIniAgosto2022: "2022-08",
  inscIniSep2022: "2022-09",
  inscIniOct2022: "2022-10",
  inscIniNov2022: "2022-11",
  inscIniDic2022: "2022-12",

  inscIniEne2023: "2023-01",
  inscIniFeb2023: "2023-02",
  inscIniMar2023: "2023-03",
  inscIniAbr2023: "2023-04",
  inscIniMay2023: "2023-05",
  inscIniJun2023: "2023-06",
  inscIniJul2023: "2023-07",
  inscIniAgo2023: "2023-08",
  inscIniSep2023: "2023-09",
  inscIniOct2023: "2023-10",
  inscIniNov2023: "2023-11",
  inscIniDic2023: "2023-12",

  inscIniEne2024: "2024-01",
  inscIniFeb2024: "2024-02",
  inscIniMar2024: "2024-03",
  inscIniAbr2024: "2024-04",
  inscIniMay2024: "2024-05",
  inscIniJun2024: "2024-06",
  inscIniJul2024: "2024-07",
  inscIniAgo2024: "2024-08",
  inscIniSep2024: "2024-09",
  inscIniOct2024: "2024-10",
  inscIniNov2024: "2024-11",
  InscIniDic2024: "2024-12",

  InscIniEne2025: "2025-01",
  InscIniFeb2025: "2025-02",
  InscIniMar2025: "2025-03",
  InscIniAbr2025: "2025-04",
  InscIniMay2025: "2025-05",
  InscIniJun2025: "2025-06",
  InscIniJul2025: "2025-07",
  InscIniAgo2025: "2025-08",
  InscIniSep2025: "2025-09",
  InscIniOct2025: "2025-10",
  InscIniNov2025: "2025-11",
  InscIniDic2025: "2025-12",

  InscIniEne2026: "2026-01",
  InscIniFeb2026: "2026-02",
  InscIniMar2026: "2026-03",
  InscIniAbr2026: "2026-04",
  InscIniMay2026: "2026-05",
  InscIniJun2026: "2026-06",
  InscIniJul2026: "2026-07",
  InscIniAgo2026: "2026-08",
};

//Columnas de inscripción que no tienen año
export const COLUMNAS_SIN_FECHA = ["inscIniOct", "inscripIni10", "inscripIni11", "inscripIni12"];

//Tipo de dato de las demás columnas
const ENTEROS = [
  "id_infante", "id_benef_infante", "matricula", "ebdi", "estatus_servicio", "activo",
  "puede_editar", "idAnt", "idPos", "baja", "motivoBaja", "discapacidad",
  "dif_cvrp", "dif_cvfn", "dif_pat", "dif_mat", "RegPesoTalla",
];
const FECHAS = [
  "fnac", "freg", "fmovimiento", "fCambioEst_ini", "fCambioEst_fin",
  "fCambioEbdi_ini", "fCambioEbdi_fin", "fBaja", "fCambio",
];
const FECHA_HORA = ["fsistema"];
const TEXTOS = [
  "ur", "nombre", "paterno", "materno", "genero", "curp", "estrato", "movimiento",
  "movSiguiente", "estratoAnt", "estratoPos", "ebdiAnt", "ebdiPos", "movimPrevio",
  "grupoDisc", "inscripcionInicial", "comentario", "usuario",
];

export const CAMPOS = { ENTEROS, FECHAS, FECHA_HORA, TEXTOS };

//Convierte a número
const aEntero = (v) => (v === null || v === undefined || v === "" ? null : Number(v));

//Convierte a fecha, la fecha vacía de MySQL queda en null
const aFecha = (v) => {
  if (!v || String(v).startsWith("0000-00-00")) return null;
  const fecha = new Date(`${String(v).replace(" ", "T")}${String(v).length === 10 ? "T00:00:00" : ""}Z`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

//Convierte a texto
const aTexto = (v) => (v === null || v === undefined ? "" : String(v));

//Convierte un renglón de MySQL en un infante
export function filaAInfante(fila) {
  const doc = {};
  for (const c of ENTEROS) if (c in fila) doc[c] = aEntero(fila[c]);
  for (const c of [...FECHAS, ...FECHA_HORA]) if (c in fila) doc[c] = aFecha(fila[c]);
  for (const c of TEXTOS) if (c in fila) doc[c] = aTexto(fila[c]);

  //El CURP en mayúsculas y sin espacios
  if (doc.curp) doc.curp = doc.curp.trim().toUpperCase();

  //Junta las inscripciones de cada mes
  doc.inscripciones = {};
  for (const [columna, mes] of Object.entries(COLUMNAS_MES)) {
    if (columna in fila) doc.inscripciones[mes] = aEntero(fila[columna]);
  }

  doc.inscripcionesSinFecha = {};
  for (const columna of COLUMNAS_SIN_FECHA) {
    if (columna in fila) doc.inscripcionesSinFecha[columna] = aEntero(fila[columna]);
  }

  return doc;
}

//Columnas que conoce el importador
export const COLUMNAS_CONOCIDAS = new Set([
  ...ENTEROS, ...FECHAS, ...FECHA_HORA, ...TEXTOS,
  ...Object.keys(COLUMNAS_MES), ...COLUMNAS_SIN_FECHA,
]);
