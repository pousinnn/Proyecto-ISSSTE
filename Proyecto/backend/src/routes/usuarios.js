//Crea cuentas nuevas, solo el admin; si es paciente también lo agrega al padrón
import { Router } from "express";
import { getDb } from "../db.js";
import { hashPassword } from "../passwords.js";
import { ErrorValidacion } from "../validaciones.js";
import { construirInfante, ID_APP_MIN, ID_APP_MAX } from "../infantes/crear.js";
import { REGIONES } from "../regiones.js";

const router = Router();
import { ROLES, LISTA_ROLES } from "../roles.js";

//Crear usuario
router.post("/", async (req, res) => {
  const { usuario, password, rol, nombre, infante, region, ebdi } = req.body ?? {};

  //Revisa usuario, contraseña y rol
  if (typeof usuario !== "string" || !/^[A-Za-z0-9._-]{3,50}$/.test(usuario)) {
    throw new ErrorValidacion("Usuario: de 3 a 50 caracteres; solo letras, números, punto, guion y guion bajo");
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new ErrorValidacion("La contraseña debe tener entre 8 y 128 caracteres");
  }
  if (!LISTA_ROLES.includes(rol)) {
    throw new ErrorValidacion(`Rol debe ser uno de: ${LISTA_ROLES.join(", ")}`);
  }

  //Revisa que el usuario no exista
  const db = getDb();
  const usuarios = db.collection("usuarios");
  if (await usuarios.findOne({ usuario })) {
    return res.status(409).json({ error: "Ese usuario ya existe" });
  }

  let cuenta;
  let infanteCreado = null;

  //Si es familia se crea el niño en el padrón
  if (rol === ROLES.FAMILIA) {
    //Busca el siguiente id_infante libre
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
    //Admin, coordinador o estancia: el coordinador necesita región y la estancia su EBDI
    if (typeof nombre !== "string" || !nombre.trim() || nombre.length > 100) {
      throw new ErrorValidacion("Nombre es obligatorio (máximo 100 caracteres)");
    }
    cuenta = { usuario, nombre: nombre.trim(), rol };
    if (rol === ROLES.COORDINADOR) {
      if (!REGIONES.includes(region)) {
        throw new ErrorValidacion(`El coordinador necesita una región: ${REGIONES.join(", ")}`);
      }
      cuenta.region = region;
    }
    if (rol === ROLES.ESTANCIA) {
      const numero = Number(ebdi);
      if (typeof ebdi === "boolean" || !Number.isInteger(numero) || numero < 1 || numero > 999) {
        throw new ErrorValidacion("La estancia necesita su número de EBDI (1 a 999)");
      }
      cuenta.ebdi = numero;
    }
  }

  //Guarda la cuenta con la contraseña en hash
  try {
    await usuarios.insertOne({
      ...cuenta,
      passwordHash: await hashPassword(password),
      creadoPor: req.usuario.sub,
      fechaCreacion: new Date(),
    });
  } catch (e) {
    //Si falla, borra el infante que se acababa de crear
    if (infanteCreado) await db.collection("infantes").deleteOne({ id_infante: infanteCreado.id_infante });
    if (e.code === 11000) return res.status(409).json({ error: "Ese usuario ya existe" });
    throw e;
  }

  //No se regresa el hash de la contraseña
  res.status(201).json({ id: cuenta.usuario, ...cuenta });
});

export default router;
