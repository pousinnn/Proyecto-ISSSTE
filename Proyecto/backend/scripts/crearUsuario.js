//crear usuario npm run crear-usuario --USUARIO "NOMBRE" CONTRASEÑA ROL
import { conectar, desconectar } from "../src/db.js";
import { hashPassword } from "../src/passwords.js";
import { REGIONES } from "../src/regiones.js";

const ROLES = ["admin", "doctor", "paciente"];
const [usuario, nombre, password, rol = "paciente", region] = process.argv.slice(2);

//Revisa los datos antes de crear el usuario
if (!usuario || !nombre || !password) {
  console.error(`Uso: npm run crear-usuario -- <usuario> "<Nombre completo>" <contraseña> [${ROLES.join("|")}] ["<región>" si es doctor]`);
  process.exit(1);
}
if (rol === "doctor" && !REGIONES.includes(region)) {
  console.error(`Un doctor necesita región (${REGIONES.join(", ")}), ej.: ... doctor "Centro Norte"`);
  process.exit(1);
}
if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres");
  process.exit(1);
}
if (!ROLES.includes(rol)) {
  console.error(`El rol debe ser uno de: ${ROLES.join(", ")}`);
  process.exit(1);
}


//Guarda el usuario con la contraseña en hash, si ya existe lo actualiza
const db = await conectar();
const passwordHash = await hashPassword(password);

const { upsertedCount } = await db
  .collection("usuarios")
  .updateOne(
    { usuario },
    { $set: { usuario, nombre, rol, passwordHash, ...(rol === "doctor" && { region }) } },
    { upsert: true },
  );

console.log(`${upsertedCount ? "Creado" : "Actualizado"}: ${usuario} (${nombre}, ${rol}${rol === "doctor" ? `, ${region}` : ""})`);
await desconectar();
