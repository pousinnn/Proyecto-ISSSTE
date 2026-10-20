//crear usuario npm run crear-usuario --USUARIO "NOMBRE" CONTRASEÑA ROL
import { conectar, desconectar } from "../src/db.js";
import { hashPassword } from "../src/passwords.js";

const ROLES = ["admin", "doctor", "paciente"];
const [usuario, nombre, password, rol = "paciente"] = process.argv.slice(2);

if (!usuario || !nombre || !password) {
  console.error(`Uso: npm run crear-usuario -- <usuario> "<Nombre completo>" <contraseña> [${ROLES.join("|")}]`);
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

const db = await conectar();
const passwordHash = await hashPassword(password);

const { upsertedCount } = await db
  .collection("usuarios")
  .updateOne({ usuario }, { $set: { usuario, nombre, rol, passwordHash } }, { upsert: true });

console.log(`${upsertedCount ? "Creado" : "Actualizado"}: ${usuario} (${nombre}, ${rol})`);
await desconectar();
