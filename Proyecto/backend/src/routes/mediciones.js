
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";
import { requiereRol } from "../middleware/auth.js";
import { validadores, ErrorValidacion } from "../validaciones.js";
import { ROLES } from "../roles.js";

//Guarda en la base de datos las mediciones del paciente
export const aCliente = ({ _id, ...resto }) => ({ id: _id.toString(), ...resto });

//Revisa que el id sea válido
const idValido = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);


//Quita caracteres especiales de la búsqueda
export const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//Error con código propio (por ejemplo 403)
const errorCon = (status, mensaje) => Object.assign(new ErrorValidacion(mensaje), { status });

//Busca las cuentas de familia cuyo niño cumple el filtro del padrón (por región o por EBDI)
export async function familiasDe(filtroInfante) {
  const ids = await getDb()
    .collection("infantes")
    .find(filtroInfante, { projection: { _id: 0, id_infante: 1 } })
    .map((i) => i.id_infante)
    .toArray();
  return getDb()
    .collection("usuarios")
    .find({ rol: ROLES.FAMILIA, id_infante: { $in: ids } }, { projection: { _id: 0, usuario: 1, nombre: 1 } })
    .sort({ nombre: 1 })
    .toArray();
}

//Lo que cada rol puede ver del padrón: coordinador su región, estancia su EBDI (IA)
export const filtroInfantes = (usuario) => {
  if (usuario.rol === ROLES.ADMIN) return {};
  if (usuario.rol === ROLES.COORDINADOR) return { region: usuario.region ?? "__sin_region__" };
  if (usuario.rol === ROLES.ESTANCIA) return { ebdi: usuario.ebdi ?? -1 };
  return { _id: { $exists: false } };
};

//Revisa que cada quien solo vea sus mediciones; un rol desconocido no ve nada (IA)
export const filtroAcceso = async (usuario) => {
  if (usuario.rol === ROLES.ADMIN) return {};
  if (usuario.rol === ROLES.FAMILIA) return { "paciente.usuario": usuario.sub };
  if (usuario.rol === ROLES.COORDINADOR) return { region: usuario.region ?? "__sin_region__" };
  if (usuario.rol === ROLES.ESTANCIA) {
    const familias = await familiasDe(filtroInfantes(usuario));
    return { "paciente.usuario": { $in: familias.map((f) => f.usuario) } };
  }
  return { _id: { $exists: false } };
};

//Solo el admin puede corregir o borrar mediciones (IA)
export const ROLES_QUE_EDITAN = [ROLES.ADMIN];

//La estancia necesita tener su EBDI asignada
export const exigirEbdiEstancia = (usuario) => {
  if (usuario.rol === ROLES.ESTANCIA && !usuario.ebdi) {
    throw errorCon(403, "No tienes una estancia (EBDI) asignada; pide a un administrador que te la asigne");
  }
};

//Saca a qué niño es la medición y su ficha del padrón
async function resolverPaciente(req) {
  const usuarios = getDb().collection("usuarios");
  const usuario = req.usuario.rol === ROLES.FAMILIA ? req.usuario.sub : req.body?.paciente;
  if (typeof usuario !== "string" || !usuario) {
    throw new ErrorValidacion("Selecciona el paciente al que pertenece la medición");
  }
  const cuenta = await usuarios.findOne({ usuario, rol: ROLES.FAMILIA });
  if (!cuenta) throw new ErrorValidacion("El paciente seleccionado no existe");

  //La estancia solo captura a los niños de su EBDI
  if (req.usuario.rol === ROLES.ESTANCIA) {
    const deSuEstancia = await familiasDe(filtroInfantes(req.usuario));
    if (!deSuEstancia.some((p) => p.usuario === usuario)) {
      throw new ErrorValidacion("Ese niño no pertenece a tu estancia");
    }
  }
  const infante = cuenta.id_infante
    ? await getDb().collection("infantes").findOne({ id_infante: cuenta.id_infante })
    : null;
  return { paciente: { usuario: cuenta.usuario, nombre: cuenta.nombre }, infante };
}

//La región de la medición sale del padrón del niño (no se puede inventar)
function regionDeLaMedicion(req, infante) {
  if (infante?.region) return infante.region;
  if (req.usuario.rol === ROLES.ADMIN) return req.body?.region;
  throw new ErrorValidacion("El niño no está ligado al padrón con una región; pide al administrador que lo revise");
}

//Campos por los que se puede ordenar
const CAMPOS_ORDENABLES = ["id", "fecha", "zona", "region", "periodo", "sexo"];

//Crea las rutas de cada tipo de medición (IA)
export function rutasMediciones(nombre) {
  const router = Router();
  const coleccion = () => getDb().collection(nombre);
  const validar = validadores[nombre];

  //Lista de mediciones con filtros y páginas
  router.get("/", async (req, res) => {
    const { _start = "0", _end = "10", _sort = "fecha", _order = "DESC", q, id } = req.query;

    const filtro = {};
    //Filtros que manda la página
    if (id !== undefined) {
      filtro._id = { $in: [id].flat().map(idValido).filter(Boolean) };
    }
    for (const campo of ["zona", "periodo", "sexo", "region"]) {
      if (typeof req.query[campo] === "string") filtro[campo] = req.query[campo];
    }
    if (req.usuario.rol !== ROLES.FAMILIA && typeof req.query.paciente === "string") {
      filtro["paciente.usuario"] = req.query.paciente;
    }
    //Búsqueda por texto
    if (typeof q === "string" && q.trim()) {
      const re = new RegExp(escaparRegex(q.trim()), "i");
      filtro.$or = [{ zona: re }, { region: re }, { periodo: re }, { sexo: re }, { "paciente.nombre": re }];
    }
    //Al final se aplica el acceso para que nadie lo pueda saltar (IA)
    Object.assign(filtro, await filtroAcceso(req.usuario));

    const campoOrden = CAMPOS_ORDENABLES.includes(_sort) ? (_sort === "id" ? "_id" : _sort) : "fecha";
    const inicio = Math.max(0, Number.parseInt(_start, 10) || 0);
    const limite = Math.min(100, Math.max(1, (Number.parseInt(_end, 10) || 10) - inicio));

    const [docs, total] = await Promise.all([
      coleccion()
        .find(filtro)
        .sort({ [campoOrden]: _order === "ASC" ? 1 : -1 })
        .skip(inicio)
        .limit(limite)
        .toArray(),
      coleccion().countDocuments(filtro),
    ]);

    res.set("X-Total-Count", String(total)).json(docs.map(aCliente));
  });

  //Ver una medición por su id
  router.get("/:id", async (req, res) => {
    const _id = idValido(req.params.id);
    const doc = _id && (await coleccion().findOne({ _id, ...(await filtroAcceso(req.usuario)) }));
    if (!doc) return res.status(404).json({ error: "No encontrado" });
    res.json(aCliente(doc));
  });

  //Guarda una medición nueva (el coordinador solo consulta, no captura)
  router.post("/", requiereRol(ROLES.ADMIN, ROLES.ESTANCIA, ROLES.FAMILIA), async (req, res) => {
    exigirEbdiEstancia(req.usuario);
    const { paciente, infante } = await resolverPaciente(req);
    const region = regionDeLaMedicion(req, infante);
    const datos = validar({ ...(req.body ?? {}), region });
    const doc = {
      ...datos,
      paciente,
      creadoPor: { usuario: req.usuario.sub, nombre: req.usuario.nombre, rol: req.usuario.rol },
      fecha: new Date(),
    };
    const { insertedId } = await coleccion().insertOne(doc);
    res.status(201).json(aCliente({ _id: insertedId, ...doc }));
  });

  //Edita una medición: solo el admin
  router.put("/:id", requiereRol(...ROLES_QUE_EDITAN), async (req, res) => {
    const _id = idValido(req.params.id);
    if (!_id) return res.status(404).json({ error: "No encontrado" });

    exigirEbdiEstancia(req.usuario);
    //Primero revisa que la medición sea de su estancia
    const acceso = await filtroAcceso(req.usuario);
    const actual = await coleccion().findOne({ _id, ...acceso }, { projection: { region: 1 } });
    if (!actual) return res.status(404).json({ error: "No encontrado" });

    //Al editar no se puede cambiar la región (solo el admin)
    const region = req.usuario.rol === ROLES.ADMIN ? req.body?.region : actual.region;
    const datos = validar({ ...(req.body ?? {}), region });
    const doc = await coleccion().findOneAndUpdate(
      { _id, ...acceso },
      {
        $set: {
          ...datos,
          modificadoPor: { usuario: req.usuario.sub, nombre: req.usuario.nombre },
          fechaModificacion: new Date(),
        },
      },
      { returnDocument: "after" },
    );
    if (!doc) return res.status(404).json({ error: "No encontrado" });
    res.json(aCliente(doc));
  });

  //Borra una medición: solo el admin
  router.delete("/:id", requiereRol(...ROLES_QUE_EDITAN), async (req, res) => {
    const _id = idValido(req.params.id);
    exigirEbdiEstancia(req.usuario);
    //Si no es de su región o estancia dice que no existe
    const doc = _id && (await coleccion().findOneAndDelete({ _id, ...(await filtroAcceso(req.usuario)) }));
    if (!doc) return res.status(404).json({ error: "No encontrado" });
    res.json(aCliente(doc));
  });

  return router;
}
