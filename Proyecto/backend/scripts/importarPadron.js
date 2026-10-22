// Importa el padrón de MySQL (archivo .sql de mysqldump) a la colección `infantes`.
//
// Uso:
//   npm run importar-padron -- <archivo.sql>             → solo revisa (no guarda nada)
//   npm run importar-padron -- <archivo.sql> --aplicar   → guarda en MongoDB
//
// Si un infante ya existe (mismo id_infante) se reemplaza con la versión del archivo,
// así que se puede correr varias veces sin duplicar.
import { readFileSync } from "node:fs";
import { conectar, desconectar } from "../src/db.js";
import { filaAInfante, COLUMNAS_CONOCIDAS } from "../src/infantes/mapeo.js";

const [archivo, ...opciones] = process.argv.slice(2);
const aplicar = opciones.includes("--aplicar");

if (!archivo) {
  console.error("Uso: npm run importar-padron -- <archivo.sql> [--aplicar]");
  process.exit(1);
}

// --- 1. Leer el archivo -------------------------------------------------------
// mysqldump normalmente escribe en UTF-8, pero la tabla original es latin1.
// Si el archivo no es UTF-8 válido, se lee como latin1 para no romper ñ y acentos.
const bytes = readFileSync(archivo);
let sql;
try {
  sql = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
} catch {
  sql = new TextDecoder("latin1").decode(bytes);
  console.log("Aviso: el archivo no es UTF-8, se leyó como latin1.");
}

// --- 2. Sacar el orden de las columnas del CREATE TABLE ------------------------
const create = sql.match(/CREATE TABLE `padron` \(([\s\S]*?)\n\)/);
if (!create) {
  console.error("No encontré `CREATE TABLE `padron`` en el archivo.");
  process.exit(1);
}
const columnasTabla = [...create[1].matchAll(/^\s*`(\w+)`/gm)].map((m) => m[1]);

const desconocidas = columnasTabla.filter((c) => !COLUMNAS_CONOCIDAS.has(c));
if (desconocidas.length) {
  console.log(`Aviso: estas columnas no están en el mapeo y se van a ignorar: ${desconocidas.join(", ")}`);
}

// --- 3. Leer los INSERT INTO `padron` ... VALUES (...),(...); -------------------
// Lector carácter por carácter que entiende textos entre comillas con escapes
// de MySQL (\' \\ \n etc.), NULL y números.
const ESCAPES = { 0: "\0", n: "\n", r: "\r", t: "\t", Z: "\x1a", b: "\b" };

function leerValores(texto, inicio) {
  const filas = [];
  let i = inicio;
  const saltarEspacios = () => {
    while (/\s/.test(texto[i])) i++;
  };

  while (i < texto.length) {
    saltarEspacios();
    if (texto[i] === ";") return { filas, fin: i + 1 };
    if (texto[i] === ",") { i++; continue; }
    if (texto[i] !== "(") throw new Error(`Formato inesperado cerca de la posición ${i}`);
    i++;

    const fila = [];
    while (true) {
      saltarEspacios();
      if (texto[i] === "'") {
        let valor = "";
        i++;
        while (texto[i] !== "'" || texto[i + 1] === "'") {
          if (texto[i] === "\\") {
            const sig = texto[i + 1];
            valor += ESCAPES[sig] ?? sig;
            i += 2;
          } else if (texto[i] === "'") {
            valor += "'"; // '' dentro de un texto = una comilla
            i += 2;
          } else {
            valor += texto[i++];
          }
        }
        i++;
        fila.push(valor);
      } else {
        let token = "";
        while (texto[i] !== "," && texto[i] !== ")") token += texto[i++];
        token = token.trim();
        fila.push(token.toUpperCase() === "NULL" ? null : token);
      }
      saltarEspacios();
      if (texto[i] === ",") { i++; continue; }
      if (texto[i] === ")") { i++; break; }
      throw new Error(`Formato inesperado cerca de la posición ${i}`);
    }
    filas.push(fila);
  }
  throw new Error("El archivo terminó a mitad de un INSERT");
}

const filas = [];
const reInsert = /INSERT INTO `padron`(?:\s*\(([^)]*)\))?\s*VALUES\s*/g;
let m;
while ((m = reInsert.exec(sql))) {
  // Si el INSERT trae su propia lista de columnas, se usa esa
  const columnas = m[1] ? m[1].split(",").map((c) => c.trim().replace(/`/g, "")) : columnasTabla;
  const { filas: valores, fin } = leerValores(sql, reInsert.lastIndex);
  for (const v of valores) {
    if (v.length !== columnas.length) {
      throw new Error(`Un renglón trae ${v.length} valores pero hay ${columnas.length} columnas`);
    }
    filas.push(Object.fromEntries(columnas.map((c, k) => [c, v[k]])));
  }
  reInsert.lastIndex = fin;
}

console.log(`Columnas en la tabla: ${columnasTabla.length}`);
console.log(`Renglones encontrados: ${filas.length}`);

if (filas.length === 0) {
  console.log("El archivo no trae datos (solo la estructura). Pide el dump con los INSERT.");
  process.exit(0);
}

// --- 4. Convertir ----------------------------------------------------------------
const docs = filas.map(filaAInfante);

// Muestra de un registro, con el CURP tapado (es dato personal)
const ejemplo = { ...docs[0] };
if (ejemplo.curp) ejemplo.curp = `${ejemplo.curp.slice(0, 4)}**************`;
ejemplo.inscripciones = `{ ${Object.keys(docs[0].inscripciones).length} meses }`;
console.log("Ejemplo del primer registro convertido:");
console.log(ejemplo);

if (!aplicar) {
  console.log("\nModo revisión: no se guardó nada. Para guardar agrega --aplicar");
  process.exit(0);
}

// --- 5. Guardar ---------------------------------------------------------------------
const db = await conectar();
// $set (y no replace): actualiza solo los campos que vienen de MySQL, así no se
// borran los que se asignan en la app (por ejemplo `region`) al volver a importar.
const operaciones = docs.map((doc) => ({
  updateOne: { filter: { id_infante: doc.id_infante }, update: { $set: doc }, upsert: true },
}));

let guardados = 0;
const errores = [];
// En bloques de 1000 para no mandar todo de golpe; ordered:false = si uno
// falla, los demás se siguen guardando
for (let k = 0; k < operaciones.length; k += 1000) {
  try {
    const r = await db.collection("infantes").bulkWrite(operaciones.slice(k, k + 1000), { ordered: false });
    // upserted = nuevos; matched = ya existían y se actualizaron
    guardados += r.upsertedCount + r.matchedCount;
  } catch (e) {
    const r = e.result;
    if (r) guardados += r.upsertedCount + r.matchedCount;
    for (const err of e.writeErrors ?? []) {
      const doc = docs[k + err.index];
      const motivo = err.code === 11000 ? "CURP o id_infante repetido" : "no cumple el validador";
      errores.push(`id_infante ${doc.id_infante}: ${motivo}`);
    }
    if (!e.writeErrors) throw e;
  }
}

console.log(`\nGuardados: ${guardados} · Con error: ${errores.length}`);
for (const e of errores.slice(0, 20)) console.log("  - " + e);
if (errores.length > 20) console.log(`  ... y ${errores.length - 20} más`);

await desconectar();
