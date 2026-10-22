
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";
import { requiereRol } from "../middleware/auth.js";
import { validadores, ErrorValidacion } from "../validaciones.js";

//Guarda en la base de datos las mediciones del paciente
export const aCliente = ({ _id, ...resto }) => ({ id: _id.toString(), ...resto });

const idValido = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);


export const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Control de acceso por registro. Sale del token firmado, no de la URL ni del body:
//   paciente → solo sus mediciones
//   doctor   → solo las de su región (sin región asignada no ve nada)
//   admin    → todo
// "__sin_region__" no coincide con ninguna región real: si al doctor le falta
// la región, el filtro no devuelve nada en lugar de devolver todo.
export const filtroAcceso = (usuario) => {
  if (usuario.rol === "paciente") return { "paciente.usuario": usuario.sub };
  if (usuario.rol === "doctor") return { region: usuario.region ?? "__sin_region__" };
  return {};
};

// Pacientes cuya ficha del padrón (id_infante) es de la región indicada
export async function pacientesDeRegion(region) {
  const ids = await getDb()
    .collection("infantes")
    .find({ region }, { projection: { _id: 0, id_infante: 1 } })
    .map((i) => i.id_infante)
    .toArray();
  return getDb()
    .collection("usuarios")
    .find({ rol: "paciente", id_infante: { $in: ids } }, { projection: { _id: 0, usuario: 1, nombre: 1 } })
    .sort({ nombre: 1 })
    .toArray();
}

const exigirRegionDoctor = (usuario) => {
  if (usuario.rol === "doctor" && !usuario.region) {
    const e = new ErrorValidacion("No tienes una región asignada; pide a un administrador que te la asigne");
    e.status = 403;
    throw e;
  }
};

async function resolverPaciente(req) {
  if (req.usuario.rol === "paciente") {

    return { usuario: req.usuario.sub, nombre: req.usuario.nombre };
  }
  const usuario = req.body?.paciente;
  if (typeof usuario !== "string" || !usuario) {
    throw new ErrorValidacion("Selecciona el paciente al que pertenece la medición");
  }
  const paciente = await getDb().collection("usuarios").findOne({ usuario, rol: "paciente" });
  if (!paciente) throw new ErrorValidacion("El paciente seleccionado no existe");

  // Un doctor solo puede capturar para pacientes de su región
  if (req.usuario.rol === "doctor") {
    const deSuRegion = await pacientesDeRegion(req.usuario.region);
    if (!deSuRegion.some((p) => p.usuario === usuario)) {
      throw new ErrorValidacion("Ese paciente no pertenece a tu región");
    }
  }
  return { usuario: paciente.usuario, nombre: paciente.nombre };
}

const CAMPOS_ORDENABLES = ["id", "fecha", "zona", "region", "periodo", "sexo"];

export function rutasMediciones(nombre) {
  const router = Router();
  const coleccion = () => getDb().collection(nombre);
  const validar = validadores[nombre];

  router.get("/", async (req, res) => {
    const { _start = "0", _end = "10", _sort = "fecha", _order = "DESC", q, id } = req.query;

    const filtro = {};
    if (id !== undefined) {
      filtro._id = { $in: [id].flat().map(idValido).filter(Boolean) };
    }
    for (const campo of ["zona", "periodo", "sexo", "region"]) {
      if (typeof req.query[campo] === "string") filtro[campo] = req.query[campo];
    }
    if (req.usuario.rol !== "paciente" && typeof req.query.paciente === "string") {
      filtro["paciente.usuario"] = req.query.paciente;
    }
    if (typeof q === "string" && q.trim()) {
      const re = new RegExp(escaparRegex(q.trim()), "i");
      filtro.$or = [{ zona: re }, { region: re }, { periodo: re }, { sexo: re }, { "paciente.nombre": re }];
    }
    // El control de acceso se aplica AL FINAL para que ningún filtro de la URL
    // (por ejemplo ?region=Sur) lo pueda sobrescribir
    Object.assign(filtro, filtroAcceso(req.usuario));

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

  router.get("/:id", async (req, res) => {
    const _id = idValido(req.params.id);
    const doc = _id && (await coleccion().findOne({ _id, ...filtroAcceso(req.usuario) }));
    if (!doc) return res.status(404).json({ error: "No encontrado" });
    res.json(aCliente(doc));
  });

  router.post("/", async (req, res) => {
    exigirRegionDoctor(req.usuario);
    const datos = validar(req.body ?? {});
    // Lo que capture un doctor siempre queda en SU región
    if (req.usuario.rol === "doctor") datos.region = req.usuario.region;
    const doc = {
      ...datos,
      paciente: await resolverPaciente(req),
      creadoPor: { usuario: req.usuario.sub, nombre: req.usuario.nombre, rol: req.usuario.rol },
      fecha: new Date(),
    };
    const { insertedId } = await coleccion().insertOne(doc);
    res.status(201).json(aCliente({ _id: insertedId, ...doc }));
  });

  router.put("/:id", requiereRol("admin", "doctor"), async (req, res) => {
    const _id = idValido(req.params.id);
    if (!_id) return res.status(404).json({ error: "No encontrado" });

    exigirRegionDoctor(req.usuario);
    // Primero el acceso: si no es de su región responde 404 antes de mirar los datos
    if (!(await coleccion().findOne({ _id, ...filtroAcceso(req.usuario) }, { projection: { _id: 1 } }))) {
      return res.status(404).json({ error: "No encontrado" });
    }
    const datos = validar(req.body ?? {});
    // El doctor solo edita mediciones de su región y no las puede mover a otra
    if (req.usuario.rol === "doctor") datos.region = req.usuario.region;
    const doc = await coleccion().findOneAndUpdate(
      { _id, ...filtroAcceso(req.usuario) },
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

  router.delete("/:id", requiereRol("admin"), async (req, res) => {
    const _id = idValido(req.params.id);
    const doc = _id && (await coleccion().findOneAndDelete({ _id }));
    if (!doc) return res.status(404).json({ error: "No encontrado" });
    res.json(aCliente(doc));
  });

  return router;
}
