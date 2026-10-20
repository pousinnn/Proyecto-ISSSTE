import { Router } from "express";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { getDb } from "../db.js";
import { hashPassword, verificarPassword } from "../passwords.js";

const router = Router();

//Limite de intentos en 10 minutos 
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera 15 minutos." },
});

//checar el hash y el token del usuario
const HASH_FALSO = await hashPassword("usuario-inexistente");

router.post("/login", limiteLogin, async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
  }

  const usuarios = getDb().collection("usuarios");
  const usuario = await usuarios.findOne({ usuario: username.trim() });
  const { valida, rehacer } = await verificarPassword(password, usuario?.passwordHash ?? HASH_FALSO);

  if (!usuario || !valida) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  if (rehacer) {
    await usuarios.updateOne({ _id: usuario._id }, { $set: { passwordHash: await hashPassword(password) } });
  }

  const token = jwt.sign(
    { sub: usuario.usuario, nombre: usuario.nombre, rol: usuario.rol },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: process.env.JWT_EXPIRES_IN ?? "1h" },
  );

  res.json({
    token,
    usuario: { id: usuario.usuario, fullName: usuario.nombre, rol: usuario.rol },
  });
});

export default router;
