//Crea un infante nuevo en el padrón cuando se registra un paciente
import { ErrorValidacion } from "../validaciones.js";
import { REGIONES } from "../regiones.js";
import { CAMPOS, COLUMNAS_MES, COLUMNAS_SIN_FECHA } from "./mapeo.js";

//Rango de ids para los infantes creados en la app
export const ID_APP_MIN = 500001;
export const ID_APP_MAX = 899999;

//Formato del CURP
const CURP = /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/;

//Revisa un texto
const texto = (v, campo, { max, obligatorio = false } = {}) => {
  if (v === undefined || v === null || v === "") {
    if (obligatorio) throw new ErrorValidacion(`${campo} es obligatorio`);
    return "";
  }
  if (typeof v !== "string") throw new ErrorValidacion(`${campo} debe ser texto`);
  const t = v.trim();
  if (obligatorio && !t) throw new ErrorValidacion(`${campo} es obligatorio`);
  if (max && t.length > max) throw new ErrorValidacion(`${campo}: máximo ${max} caracteres`);
  return t;
};

//Revisa un número entero
const entero = (v, campo, { min = 0, max = 2147483647, obligatorio = false } = {}) => {
  if (v === undefined || v === null || v === "") {
    if (obligatorio) throw new ErrorValidacion(`${campo} es obligatorio`);
    return 0;
  }
  const n = Number(v);
  if (typeof v === "boolean" || !Number.isInteger(n) || n < min || n > max) {
    throw new ErrorValidacion(`${campo} debe ser un número entero entre ${min} y ${max}`);
  }
  return n;
};

//Revisa una fecha
const fecha = (v, campo, { obligatorio = false } = {}) => {
  if (v === undefined || v === null || v === "") {
    if (obligatorio) throw new ErrorValidacion(`${campo} es obligatoria`);
    return null;
  }
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(v)) {
    throw new ErrorValidacion(`${campo} debe tener formato AAAA-MM-DD`);
  }
  const f = new Date(`${v.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(f.getTime())) throw new ErrorValidacion(`${campo} no es una fecha válida`);
  return f;
};

//Valida los datos y arma el infante
export function construirInfante(d, { idInfante, creadoPor }) {
  if (!d || typeof d !== "object" || Array.isArray(d)) {
    throw new ErrorValidacion("Faltan los datos del padrón del paciente");
  }
  const hoy = new Date();

  //Revisa que sea menor de 18 años
  const fnac = fecha(d.fnac, "Fecha de nacimiento", { obligatorio: true });
  if (fnac > hoy) throw new ErrorValidacion("La fecha de nacimiento no puede ser futura");
  const edadAnios = (hoy - fnac) / (365.25 * 86400000);
  if (edadAnios > 18) throw new ErrorValidacion("El paciente debe ser menor de 18 años");

  const freg = fecha(d.freg, "Fecha de registro") ?? new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
  if (freg < fnac || freg > hoy) throw new ErrorValidacion("La fecha de registro debe estar entre el nacimiento y hoy");

  //Revisa CURP, género y región
  const curp = texto(d.curp, "CURP", { obligatorio: true }).toUpperCase();
  if (!CURP.test(curp)) throw new ErrorValidacion("El CURP no tiene un formato válido (18 caracteres)");

  const genero = texto(d.genero, "Género", { obligatorio: true });
  if (!["M", "F"].includes(genero)) throw new ErrorValidacion("Género debe ser M o F");

  if (!REGIONES.includes(d.region)) {
    throw new ErrorValidacion(`Región debe ser una de: ${REGIONES.join(", ")}`);
  }

  const discapacidad = d.discapacidad === true || d.discapacidad === 1 ? 1 : 0;

  //Pone todos los campos con su valor por defecto
  const doc = {};
  for (const c of CAMPOS.ENTEROS) doc[c] = 0;
  for (const c of [...CAMPOS.FECHAS, ...CAMPOS.FECHA_HORA]) doc[c] = null;
  for (const c of CAMPOS.TEXTOS) doc[c] = "";

  //Llena los datos del formulario
  Object.assign(doc, {
    id_infante: idInfante,
    id_benef_infante: entero(d.id_benef_infante, "ID de beneficiario", { max: 99999 }),
    matricula: entero(d.matricula, "Matrícula del derechohabiente", { max: 9999999999 }),
    ur: texto(d.ur, "UR", { max: 3 }),
    ebdi: entero(d.ebdi, "EBDI", { min: 1, max: 999, obligatorio: true }),
    nombre: texto(d.nombre, "Nombre", { max: 50, obligatorio: true }),
    paterno: texto(d.paterno, "Apellido paterno", { max: 50, obligatorio: true }),
    materno: texto(d.materno, "Apellido materno", { max: 50 }),
    genero,
    curp,
    fnac,
    freg,
    fsistema: hoy,
    estatus_servicio: 1,
    estrato: texto(d.estrato, "Estrato", { max: 2 }),
    activo: 1,
    discapacidad,
    grupoDisc: discapacidad ? texto(d.grupoDisc, "Tipo de discapacidad", { max: 25 }) : "",
    comentario: texto(d.comentario, "Comentario", { max: 500 }),
    inscripcionInicial: texto(d.inscripcionInicial, "Inscripción inicial", { max: 15 }),
    usuario: creadoPor, // como en MySQL: quién dio de alta el registro
    region: d.region,
  });

  //Marca los meses inscritos desde el registro hasta hoy
  doc.inscripciones = {};
  for (const mes of Object.values(COLUMNAS_MES)) {
    const [a, m] = mes.split("-").map(Number);
    const inicio = new Date(Date.UTC(a, m - 1, 1));
    const fin = new Date(Date.UTC(a, m, 0));
    doc.inscripciones[mes] = inicio > hoy ? null : fin >= freg ? 1 : 0;
  }
  doc.inscripcionesSinFecha = Object.fromEntries(COLUMNAS_SIN_FECHA.map((c) => [c, 0]));

  return doc;
}
