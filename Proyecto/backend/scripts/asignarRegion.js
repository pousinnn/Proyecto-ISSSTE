//cambia la region de un coordinador npm run asignar-region
import { conectar, desconectar } from "../src/db.js";
import { REGIONES } from "../src/regiones.js";

const [usuario, region] = process.argv.slice(2);

//revisa que haya  usuario y una region valida
if (!usuario || !region) {
  console.error('Uso: npm run asignar-region -- <usuario> "<región>"');
  process.exit(1);
}
if (!REGIONES.includes(region)) {
  console.error(`La región debe ser una de: ${REGIONES.join(", ")}`);
  process.exit(1);
}

//busca al coordinador y le guarda la regioon
const db = await conectar();
const cuenta = await db.collection("usuarios").findOne({ usuario });

if (!cuenta) {
  console.error(`No existe el usuario ${usuario}`);
} else if (cuenta.rol !== "coordinador") {
  console.error(`${usuario} es ${cuenta.rol}; solo los coordinadores tienen región`);
} else {
  await db.collection("usuarios").updateOne({ usuario }, { $set: { region } });
  console.log(`${usuario} (${cuenta.nombre}) ahora es de la región ${region}`);
  console.log("Debe cerrar sesión y volver a entrar para que aplique.");
}

await desconectar();
