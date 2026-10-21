// Estructura y validación de la colección `infantes` (el padrón).
//
// MongoDB no obliga a tener columnas fijas como MySQL, pero sí permite
// definir un "validador" ($jsonSchema): la propia base de datos rechaza
// cualquier documento que no cumpla estas reglas, venga de donde venga
// (el API, el importador, Compass o mongosh).
import { CAMPOS, COLUMNAS_SIN_FECHA } from "./mapeo.js";

const tipo = (bsonType) => ({ bsonType });
const MES = "^\\d{4}-(0[1-9]|1[0-2])$";
// CURP: 4 letras, 6 dígitos (fecha), sexo (H/M/X), 5 letras, 1 alfanumérico, 1 dígito
// También se permite vacío porque en MySQL el valor por defecto es ''.
const CURP = "^$|^[A-Z]{4}\\d{6}[HMX][A-Z]{5}[A-Z0-9]\\d$";

const propiedades = {
  ...Object.fromEntries(CAMPOS.ENTEROS.map((c) => [c, tipo(["int", "long", "null"])])),
  ...Object.fromEntries(CAMPOS.FECHAS.map((c) => [c, tipo(["date", "null"])])),
  ...Object.fromEntries(CAMPOS.FECHA_HORA.map((c) => [c, tipo(["date", "null"])])),
  ...Object.fromEntries(CAMPOS.TEXTOS.map((c) => [c, tipo("string")])),
};

export const VALIDADOR = {
  $jsonSchema: {
    bsonType: "object",
    required: ["id_infante", "nombre", "paterno", "inscripciones"],
    properties: {
      ...propiedades,
      id_infante: { bsonType: ["int", "long"], minimum: 1 },
      curp: { bsonType: "string", pattern: CURP },
      nombre: { bsonType: "string", maxLength: 50 },
      paterno: { bsonType: "string", maxLength: 50 },
      materno: { bsonType: "string", maxLength: 50 },
      comentario: { bsonType: "string", maxLength: 500 },
      inscripciones: {
        bsonType: "object",
        // Solo se aceptan claves "AAAA-MM" con valor numérico o vacío
        patternProperties: { [MES]: tipo(["int", "long", "null"]) },
        additionalProperties: false,
      },
      inscripcionesSinFecha: {
        bsonType: "object",
        properties: Object.fromEntries(COLUMNAS_SIN_FECHA.map((c) => [c, tipo(["int", "long", "null"])])),
        additionalProperties: false,
      },
    },
  },
};

export async function prepararInfantes(db) {
  const existe = await db.listCollections({ name: "infantes" }).hasNext();
  if (existe) {
    // Si ya existe, actualiza las reglas por si cambiaron
    await db.command({ collMod: "infantes", validator: VALIDADOR, validationLevel: "strict" });
  } else {
    await db.createCollection("infantes", { validator: VALIDADOR, validationLevel: "strict" });
  }

  const infantes = db.collection("infantes");
  // id_infante es la llave primaria de MySQL → único aquí también
  await infantes.createIndex({ id_infante: 1 }, { unique: true });
  // Un CURP no se puede repetir (pero varios pueden estar vacíos)
  await infantes.createIndex(
    { curp: 1 },
    { unique: true, partialFilterExpression: { curp: { $type: "string", $gt: "" } } },
  );
  // Para buscar rápido por estancia y por nombre
  await infantes.createIndex({ ebdi: 1 });
  await infantes.createIndex({ paterno: 1, materno: 1, nombre: 1 });
}
