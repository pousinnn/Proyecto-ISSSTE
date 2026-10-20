import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URL ?? "mongodb://127.0.0.1:27017");

let db;
//Conecta la base de datos de mongodb
export async function conectar() {
  await client.connect();
  db = client.db(process.env.MONGO_DB ?? "issste");

  await db.collection("usuarios").createIndex({ usuario: 1 }, { unique: true });
  for (const coleccion of ["pesoytalla", "tallablanca", "perimetrocefalico"]) {
    await db.collection(coleccion).createIndex({ fecha: -1 });
  }

  return db;
}

export function getDb() {
  if (!db) throw new Error("La base de datos no está conectada");
  return db;
}

export async function desconectar() {
  await client.close();
}
