//Reglas que mongodb revisa antes de guardar un infante
import { CAMPOS, COLUMNAS_SIN_FECHA } from "./mapeo.js";
import { REGIONES } from "../regiones.js";

const tipo = (bsonType) => ({ bsonType });
const MES = "^\\d{4}-(0[1-9]|1[0-2])$";
//Formato del CURP, también puede ir vacío
const CURP = "^$|^[A-Z]{4}\\d{6}[HMX][A-Z]{5}[A-Z0-9]\\d$";

//Tipo de dato de cada campo
const propiedades = {
  ...Object.fromEntries(CAMPOS.ENTEROS.map((c) => [c, tipo(["int", "long", "null"])])),
  ...Object.fromEntries(CAMPOS.FECHAS.map((c) => [c, tipo(["date", "null"])])),
  ...Object.fromEntries(CAMPOS.FECHA_HORA.map((c) => [c, tipo(["date", "null"])])),
  ...Object.fromEntries(CAMPOS.TEXTOS.map((c) => [c, tipo("string")])),
};

//Validador de la colección infantes
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
      //La región la pone el admin desde la app
      region: { enum: REGIONES },
      inscripciones: {
        bsonType: "object",
        //Solo meses tipo AAAA-MM con número o vacío
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

//Crea la colección infantes con sus reglas e índices
export async function prepararInfantes(db) {
  const existe = await db.listCollections({ name: "infantes" }).hasNext();
  if (existe) {
    //Si ya existe, actualiza las reglas
    await db.command({ collMod: "infantes", validator: VALIDADOR, validationLevel: "strict" });
  } else {
    await db.createCollection("infantes", { validator: VALIDADOR, validationLevel: "strict" });
  }

  const infantes = db.collection("infantes");
  //El id_infante no se puede repetir
  await infantes.createIndex({ id_infante: 1 }, { unique: true });
  //El CURP no se puede repetir, pero puede ir vacío
  await infantes.createIndex(
    { curp: 1 },
    { unique: true, partialFilterExpression: { curp: { $type: "string", $gt: "" } } },
  );
  //Para buscar más rápido por estancia y nombre
  await infantes.createIndex({ ebdi: 1 });
  await infantes.createIndex({ paterno: 1, materno: 1, nombre: 1 });
}
