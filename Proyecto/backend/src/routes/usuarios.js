// POST /api/users — crear cuentas (solo admin; se aplica en server.js).
//
// Body: { usuario, password, rol, nombre }            para admin y doctor
//       { usuario, password, rol: "paciente", infante: {...datos del padrón} }
//
// Si es paciente, en la misma operación se da de alta su registro en el
// padrón (`infantes`) y la cuenta queda ligada con `id_infante`.
import { Router } from "express";
import { getDb } from "../db.js";
import { hashPassword } from "../passwords.js";
import { ErrorValidacion } from "../validaciones.js";
import { construirInfante, ID_APP_MIN, ID_APP_MAX } from "../infantes/crear.js";

const router = Router();
const ROLES = ["admin", "doctor", "paciente"];

router.post("/", async (req, res) => {
  const { usuario, password, rol, nombre, infante } = req.body ?? {};

  if (typeof usuario !== "string" || !/^[A-Za-z0-9._-]{3,50}$/.test(usuario)) {
    throw new ErrorValidacion("Usuario: de 3 a 50 caracteres; solo letras, números, punto, guion y guion bajo");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new ErrorValidacion("La contraseña debe tener entre 8 y 128 caracteres");
  }
  if (!ROLES.includes(rol)) {
    throw new ErrorValidacion(`Rol debe ser uno de: ${ROLES.join(", ")}`);
  }

  const db = getDb();
  const usuarios = db.collection("usuarios");
  if (await usuarios.findOne({ usuario })) {
    return res.status(409).json({ error: "Ese usuario ya existe" });
  }

  let cuenta;
  let infanteCreado = null;

  if (rol === "paciente") {
    // El siguiente id_infante libre dentro del rango de la app
    const ultimo = await db
      .collection("infantes")
      .find({ id_infante: { $gte: ID_APP_MIN, $lte: ID_APP_MAX } })
      .sort({ id_infante: -1 })
      .limit(1)
      .next();
    const idInfante = ultimo ? ultimo.id_infante + 1 : ID_APP_MIN;

    const doc = construirInfante(infante, { idInfante, creadoPor: req.usuario.sub });
    if (await db.collection("infantes").findOne({ curp: doc.curp })) {
      return res.status(409).json({ error: "Ya hay un infante con ese CURP en el padrón" });
    }

    await db.collection("infantes").insertOne(doc);
    infanteCreado = doc;
    cuenta = {
      usuario,
      nombre: [doc.nombre, doc.paterno, doc.materno].filter(Boolean).join(" "),
      rol,
      id_infante: doc.id_infante,
    };
  } else {
    if (typeof nombre !== "string" || !nombre.trim() || nombre.length > 100) {
      throw new ErrorValidacion("Nombre es obligatorio (máximo 100 caracteres)");
    }
    cuenta = { usuario, nombre: nombre.trim(), rol };
  }

  try {
    await usuarios.insertOne({
      ...cuenta,
      passwordHash: await hashPassword(password),
      creadoPor: req.usuario.sub,
      fechaCreacion: new Date(),
    });
  } catch (e) {
    // Si la cuenta no se pudo guardar, no dejamos un infante huérfano en el padrón
    if (infanteCreado) await db.collection("infantes").deleteOne({ id_infante: infanteCreado.id_infante });
    if (e.code === 11000) return res.status(409).json({ error: "Ese usuario ya existe" });
    throw e;
  }

  // Nunca se regresa el hash de la contraseña
  res.status(201).json({ id: cuenta.usuario, ...cuenta });
});

export default router;
