// Agrega datos FALSOS a la base actual para probar la app.
//
// Uso:
//   npm run datos-demo              → borra los datos demo anteriores y crea nuevos
//   npm run datos-demo -- --borrar  → solo borra los datos demo
//
// Todo lo que crea este script lleva `demo: true`. Así se puede borrar después
// sin tocar los datos reales (usuarios del equipo, capturas reales, padrón importado).
// Los infantes demo usan id_infante desde 900001 para no chocar con el padrón real.
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { conectar, desconectar } from "../src/db.js";
import { hashPassword } from "../src/passwords.js";
import { validadores } from "../src/validaciones.js";
import { REGIONES } from "../src/regiones.js";
import { CAMPOS, COLUMNAS_MES, COLUMNAS_SIN_FECHA } from "../src/infantes/mapeo.js";

const soloBorrar = process.argv.includes("--borrar");
const COLECCIONES = ["usuarios", "infantes", "pesoytalla", "tallablanca", "perimetrocefalico"];

const db = await conectar();

// --- 1. Borrar los datos demo anteriores --------------------------------------
for (const c of COLECCIONES) {
  const { deletedCount } = await db.collection(c).deleteMany({ demo: true });
  if (deletedCount) console.log(`Borrados de ${c}: ${deletedCount}`);
}
if (soloBorrar) {
  console.log("Datos demo borrados.");
  await desconectar();
  process.exit(0);
}

// --- 2. Generador de números "aleatorios" con semilla fija ---------------------
// Siempre salen los mismos datos, así las pruebas son repetibles.
let semilla = 20261021;
const azar = () => {
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const entre = (min, max) => min + azar() * (max - min);
const entero = (min, max) => Math.floor(entre(min, max + 1));
const uno = (lista) => lista[Math.floor(azar() * lista.length)];
const r1 = (n) => Math.round(n * 10) / 10;

const NINAS = ["Sofía", "Valentina", "Regina", "Camila", "Ximena", "María José", "Renata", "Victoria", "Natalia", "Isabella", "Fernanda", "Ana Paula"];
const NINOS = ["Santiago", "Mateo", "Sebastián", "Leonardo", "Emiliano", "Diego", "Daniel", "Miguel Ángel", "Iker", "Gael", "José Luis", "Alejandro"];
const APELLIDOS = ["Hernández", "García", "Martínez", "López", "González", "Pérez", "Rodríguez", "Sánchez", "Ramírez", "Cruz", "Flores", "Gómez", "Morales", "Vázquez", "Reyes", "Jiménez", "Torres", "Díaz", "Gutiérrez", "Ruiz", "Mendoza", "Aguilar", "Ortiz", "Castillo", "Núñez", "Peña"];
const EBDIS = [3, 7, 12, 15, 21, 28, 34, 40];
const ESTADOS_CURP = ["DF", "MC", "JC", "NL", "PL", "VZ", "GT", "YN"];

// --- 3. CURP falso pero con formato válido ---------------------------------------
const ascii = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/Ñ/g, "X").replace(/[^A-Z]/g, "");
const primeraVocalInterna = (s) => (ascii(s).slice(1).match(/[AEIOU]/) ?? ["X"])[0];
const consonanteInterna = (s) => (ascii(s).slice(1).match(/[^AEIOU]/) ?? ["X"])[0];
const curpsUsados = new Set();
function curp(nombre, paterno, materno, fnac, sexo) {
  const n = nombre.split(" ")[0];
  const fecha = fnac.toISOString().slice(2, 10).replace(/-/g, "");
  const base =
    ascii(paterno)[0] + primeraVocalInterna(paterno) + (ascii(materno)[0] ?? "X") + ascii(n)[0] +
    fecha + (sexo === "niño" ? "H" : "M") + uno(ESTADOS_CURP) +
    consonanteInterna(paterno) + consonanteInterna(materno) + consonanteInterna(n);
  // Homoclave: letra para nacidos desde 2000
  let c;
  do c = base + String.fromCharCode(65 + entero(0, 25)) + entero(0, 9);
  while (curpsUsados.has(c));
  curpsUsados.add(c);
  return c;
}

// --- 4. Crecimiento aproximado por edad (para que los números sean creíbles) ----
const tallaEsperada = (m) => (m <= 12 ? 50 + (25 * m) / 12 : m <= 24 ? 75 + (12 * (m - 12)) / 12 : 87 + (6.5 * (m - 24)) / 12);
const pesoEsperado = (m) => (m <= 12 ? 3.3 + (6.7 * m) / 12 : m <= 24 ? 10 + (2.2 * (m - 12)) / 12 : 12.2 + (2 * (m - 24)) / 12);
const cabezaEsperada = (m) => (m <= 12 ? 35 + (11 * m) / 12 : m <= 24 ? 46 + (2 * (m - 12)) / 12 : Math.min(52, 48 + (0.5 * (m - 24)) / 12));
const mesesEntre = (desde, hasta) =>
  (hasta.getUTCFullYear() - desde.getUTCFullYear()) * 12 + (hasta.getUTCMonth() - desde.getUTCMonth()) - (hasta.getUTCDate() < desde.getUTCDate() ? 1 : 0);
const fechaUTC = (a, m, d) => new Date(Date.UTC(a, m - 1, d));
const aTextoFecha = (f) => f.toISOString().slice(0, 10);
const HOY = new Date();

// --- 5. Infantes del padrón -------------------------------------------------------
const TOTAL_INFANTES = 40;
const CON_CUENTA = 12; // los primeros 12 tienen cuenta de paciente y mediciones
const infantes = [];

for (let i = 0; i < TOTAL_INFANTES; i++) {
  const sexo = azar() < 0.5 ? "niña" : "niño";
  const nombre = uno(sexo === "niña" ? NINAS : NINOS);
  const paterno = uno(APELLIDOS);
  let materno = uno(APELLIDOS);
  while (materno === paterno) materno = uno(APELLIDOS);

  const fnac = fechaUTC(entero(2020, 2025), entero(1, 12), entero(1, 28));
  if (fnac > fechaUTC(2025, 6, 30)) fnac.setUTCFullYear(2024);
  const freg = new Date(fnac.getTime() + entero(60, 400) * 86400000);
  const deBaja = i >= CON_CUENTA && azar() < 0.15;
  const fBaja = deBaja ? new Date(Math.min(HOY.getTime() - 30 * 86400000, freg.getTime() + entero(200, 900) * 86400000)) : null;
  const ebdi = uno(EBDIS);

  const doc = {};
  for (const c of CAMPOS.ENTEROS) doc[c] = 0;
  for (const c of [...CAMPOS.FECHAS, ...CAMPOS.FECHA_HORA]) doc[c] = null;
  for (const c of CAMPOS.TEXTOS) doc[c] = "";

  Object.assign(doc, {
    id_infante: 900001 + i,
    id_benef_infante: 50000 + i,
    matricula: entero(1000000, 9999999),
    ur: uno(["09A", "15B", "14C", "19D"]),
    ebdi,
    nombre,
    paterno,
    materno,
    genero: sexo === "niño" ? "M" : "F",
    curp: curp(nombre, paterno, materno, fnac, sexo),
    fnac,
    freg,
    fsistema: freg,
    estatus_servicio: deBaja ? 2 : 1,
    estrato: uno(["A", "B", "C"]),
    activo: deBaja ? 0 : 1,
    baja: deBaja ? 1 : 0,
    fBaja,
    motivoBaja: deBaja ? entero(1, 5) : 0,
    discapacidad: azar() < 0.1 ? 1 : 0,
    RegPesoTalla: i < CON_CUENTA ? 1 : 0,
    usuario: "datos-demo",
    region: uno(REGIONES),
    demo: true,
  });
  doc.grupoDisc = doc.discapacidad ? uno(["Auditiva", "Visual", "Motriz", "Lenguaje"]) : "";
  doc.comentario = i % 9 === 0 ? "Registro de prueba generado automáticamente" : "";

  // Inscrito cada mes desde que se registró hasta la baja (o hasta hoy)
  doc.inscripciones = {};
  for (const mes of Object.values(COLUMNAS_MES)) {
    const [a, m] = mes.split("-").map(Number);
    const inicioMes = fechaUTC(a, m, 1);
    const finMes = fechaUTC(a, m + 1, 0);
    const inscrito = finMes >= freg && inicioMes <= (fBaja ?? HOY) && inicioMes <= HOY;
    doc.inscripciones[mes] = inicioMes > HOY ? null : inscrito ? 1 : 0;
  }
  doc.inscripcionesSinFecha = Object.fromEntries(COLUMNAS_SIN_FECHA.map((c) => [c, 0]));

  infantes.push({ doc, sexo, factor: entre(0.94, 1.06) });
}

await db.collection("infantes").insertMany(infantes.map((x) => x.doc));
console.log(`Infantes demo: ${infantes.length} (id_infante 900001 a ${900000 + infantes.length})`);

// --- 6. Cuentas ----------------------------------------------------------------------
const password = randomBytes(9).toString("base64url");
const hash = await hashPassword(password);
const usuarioDe = (x) =>
  `demo.${ascii(x.doc.nombre.split(" ")[0]).toLowerCase()}.${ascii(x.doc.paterno).toLowerCase()}`;

const doctores = [
  { usuario: "demo.dra.mendez", nombre: "Dra. Laura Méndez", rol: "doctor" },
  { usuario: "demo.dr.salinas", nombre: "Dr. Jorge Salinas", rol: "doctor" },
];
const pacientes = [];
const usuariosUsados = new Set(doctores.map((d) => d.usuario));
for (const x of infantes.slice(0, CON_CUENTA)) {
  let u = usuarioDe(x);
  for (let k = 2; usuariosUsados.has(u); k++) u = `${usuarioDe(x)}${k}`;
  usuariosUsados.add(u);
  pacientes.push({
    usuario: u,
    nombre: `${x.doc.nombre} ${x.doc.paterno} ${x.doc.materno}`,
    rol: "paciente",
    id_infante: x.doc.id_infante,
    infante: x,
  });
}

// No pisar cuentas reales que por casualidad se llamen igual
const existentes = await db
  .collection("usuarios")
  .find({ usuario: { $in: [...usuariosUsados] }, demo: { $ne: true } })
  .toArray();
if (existentes.length) {
  console.error(`Ya existen cuentas reales con estos nombres: ${existentes.map((e) => e.usuario).join(", ")}`);
  process.exit(1);
}

await db.collection("usuarios").insertMany(
  [...doctores, ...pacientes].map(({ infante, ...u }) => ({ ...u, passwordHash: hash, demo: true })),
);
console.log(`Cuentas demo: ${doctores.length} doctores + ${pacientes.length} pacientes`);

// --- 7. Mediciones (pasan por los MISMOS validadores que el API) -------------------
const CAPTURAS = [
  { periodo: "2026-1", fecha: fechaUTC(2026, 2, 16) },
  { periodo: "2026-1", fecha: fechaUTC(2026, 5, 11) },
  { periodo: "2026-2", fecha: fechaUTC(2026, 9, 8) },
];
const mediciones = { pesoytalla: [], tallablanca: [], perimetrocefalico: [] };

for (const p of pacientes) {
  const { doc: inf, sexo, factor } = p.infante;
  const comunes = { sexo, region: inf.region, zona: `EBDI ${inf.ebdi}` };
  const doctor = uno(doctores);
  const meta = (fecha) => ({
    paciente: { usuario: p.usuario, nombre: p.nombre },
    creadoPor: { usuario: doctor.usuario, nombre: doctor.nombre, rol: "doctor" },
    fecha: new Date(fecha.getTime() + entero(9, 16) * 3600000),
    demo: true,
  });

  for (const { periodo, fecha } of CAPTURAS) {
    const meses = mesesEntre(inf.fnac, fecha);
    if (meses < 1) continue;

    const enLibras = azar() < 0.15;
    const kg = pesoEsperado(meses) * factor * entre(0.97, 1.03);
    const datos = validadores.pesoytalla({
      ...comunes,
      periodo,
      fechaNacimiento: aTextoFecha(inf.fnac),
      altura: r1(tallaEsperada(meses) * (0.5 + factor / 2) * entre(0.99, 1.01)),
      unidadAltura: "cm",
      peso: r1(enLibras ? kg / 0.45359237 : kg),
      unidadPeso: enLibras ? "lb" : "kg",
    });
    // La edad se calcula al día de la medición, no a hoy
    datos.edadMeses = meses;
    datos.edad = `${Math.floor(meses / 12)} años y ${meses % 12} meses`;
    mediciones.pesoytalla.push({ ...datos, ...meta(fecha) });

    mediciones.perimetrocefalico.push({
      ...validadores.perimetrocefalico({
        ...comunes,
        periodo,
        perimetro: r1(cabezaEsperada(meses) * (0.5 + factor / 2) * entre(0.99, 1.01)),
        unidad: "cm",
      }),
      ...meta(fecha),
    });
  }

  const papa = r1(entre(160, 185));
  const mama = r1(entre(148, 170));
  mediciones.tallablanca.push({
    ...validadores.tallablanca({
      ...comunes,
      periodo: "2026-1",
      alturaPadre: papa,
      unidadPadre: "cm",
      alturaMadre: mama,
      unidadMadre: "cm",
    }),
    ...meta(CAPTURAS[0].fecha),
  });
}

for (const [coleccion, docs] of Object.entries(mediciones)) {
  if (docs.length) await db.collection(coleccion).insertMany(docs);
  console.log(`Mediciones demo en ${coleccion}: ${docs.length}`);
}

// --- 8. Guardar las cuentas en un archivo que NO se sube a git -----------------------
const lineas = [
  "Cuentas DEMO (datos falsos). NO subir a GitHub.",
  `Contraseña de todas las cuentas demo: ${password}`,
  "",
  "Doctores:",
  ...doctores.map((d) => `  ${d.usuario.padEnd(26)} ${d.nombre}`),
  "",
  "Pacientes (cada uno ve solo sus mediciones):",
  ...pacientes.map((p) => `  ${p.usuario.padEnd(26)} ${p.nombre} · región ${p.infante.doc.region}`),
  "",
  "Para borrar todos los datos demo:  npm run datos-demo -- --borrar",
];
writeFileSync(new URL("../cuentas-demo.txt", import.meta.url), lineas.join("\n") + "\n", "utf8");
console.log("\nUsuarios y contraseña guardados en backend/cuentas-demo.txt");

await desconectar();
