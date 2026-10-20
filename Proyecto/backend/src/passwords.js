
import argon2 from "argon2";

const OPCIONES = { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 };

export const hashPassword = (password) => argon2.hash(password, OPCIONES);

export async function verificarPassword(password, hash) {
  if (!hash.startsWith("$argon2")) {
    return { valida: false, rehacer: false };
  }
  const valida = await argon2.verify(hash, password);
  return { valida, rehacer: valida && argon2.needsRehash(hash, OPCIONES) };
}
