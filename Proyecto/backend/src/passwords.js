//Hashea la contraseña con argon2 (IA)
import argon2 from "argon2";

//Configuración de argon2 (IA)
const OPCIONES = { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 };

//Convierte la contraseña en hash 
export const hashPassword = (password) => argon2.hash(password, OPCIONES);

//Revisa si la contraseña es correcta (IA)
export async function verificarPassword(password, hash) {
  if (!hash.startsWith("$argon2")) {
    return { valida: false, rehacer: false };
  }
  const valida = await argon2.verify(hash, password);
  return { valida, rehacer: valida && argon2.needsRehash(hash, OPCIONES) };
}
