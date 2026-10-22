//Cambia los roles viejos a los nuevos: doctor → coordinador, paciente → familia
//Se puede correr varias veces sin problema: npm run migrar-roles
import { conectar, desconectar } from "../src/db.js";

const CAMBIOS = { doctor: "coordinador", paciente: "familia" };

const db = await conectar();

//Cambia el rol de las cuentas (la contraseña y lo demás no se toca)
for (const [viejo, nuevo] of Object.entries(CAMBIOS)) {
  const { modifiedCount } = await db.collection("usuarios").updateMany({ rol: viejo }, { $set: { rol: nuevo } });
  console.log(`Cuentas ${viejo} → ${nuevo}: ${modifiedCount}`);
}

//También en el "capturado por" de las mediciones, para que se vea el rol nuevo
for (const coleccion of ["pesoytalla", "tallablanca", "perimetrocefalico"]) {
  for (const [viejo, nuevo] of Object.entries(CAMBIOS)) {
    await db.collection(coleccion).updateMany({ "creadoPor.rol": viejo }, { $set: { "creadoPor.rol": nuevo } });
  }
}

//Avisa de los coordinadores que todavía no tienen región
const sinRegion = await db.collection("usuarios").find({ rol: "coordinador", region: { $exists: false } }).toArray();
for (const c of sinRegion) {
  console.log(`Ojo: ${c.usuario} no tiene región; asígnala con npm run asignar-region -- ${c.usuario} "<región>"`);
}

await desconectar();
