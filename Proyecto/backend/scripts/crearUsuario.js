//crear usuario npm run crear-usuario 
import { conectar, desconectar } from "../src/db.js";
import { hashPassword } from "../src/passwords.js";
import { REGIONES } from "../src/regiones.js";
import { ROLES, LISTA_ROLES } from "../src/roles.js";

const [usuario, nombre, password, rol = ROLES.FAMILIA, extra] = process.argv.slice(2);

//revisa los datos antes de crear el usuario
if (!usuario || !nombre || !password) {
  console.error(`Uso: npm run crear-usuario -- <usuario> "<Nombre completo>" <contraseña> [${LISTA_ROLES.join("|")}] ["<región>" si es coordinador | <EBDI> si es estancia]`);
  process.exit(1);
}
if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres");
  process.exit(1);
}
if (!LISTA_ROLES.includes(rol)) {
  console.error(`El rol debe ser uno de: ${LISTA_ROLES.join(", ")}`);
  process.exit(1);
}
//el coordinador necesita region y la estancia su numero de EBDI
if (rol === ROLES.COORDINADOR && !REGIONES.includes(extra)) {
  console.error(`Un coordinador necesita región (${REGIONES.join(", ")}), ej.: ... coordinador "Centro Norte"`);
  process.exit(1);
}
const ebdi = Number(extra);
if (rol === ROLES.ESTANCIA && !(Number.isInteger(ebdi) && ebdi >= 1 && ebdi <= 999)) {
  console.error("Una estancia necesita su número de EBDI (1 a 999), ej.: ... estancia 12");
  process.exit(1);
}


//guarda el usuario con la contraseña en hash, si ya existe lo actualiza
const db = await conectar();
const passwordHash = await hashPassword(password);
const datos = {
  usuario,
  nombre,
  rol,
  passwordHash,
  ...(rol === ROLES.COORDINADOR && { region: extra }),
  ...(rol === ROLES.ESTANCIA && { ebdi }),
};

const { upsertedCount } = await db.collection("usuarios").updateOne({ usuario }, { $set: datos }, { upsert: true });

const detalle = rol === ROLES.COORDINADOR ? `, ${extra}` : rol === ROLES.ESTANCIA ? `, EBDI ${ebdi}` : "";
console.log(`${upsertedCount ? "Creado" : "Actualizado"}: ${usuario} (${nombre}, ${rol}${detalle})`);
await desconectar();
