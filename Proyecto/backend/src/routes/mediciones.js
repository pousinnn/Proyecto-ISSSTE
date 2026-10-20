
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";
import { requiereRol } from "../middleware/auth.js";
import { validadores, ErrorValidacion } from "../validaciones.js";

//Guarda en la base de datos las mediciones del paciente
export const aCliente = ({ _id, ...resto }) => ({ id: _id.toString(), ...resto });

const idValido = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);


export const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const filtroAcceso = (usuario) =>
  usuario.rol === "paciente" ? { "paciente.usuario": usuario.sub } : {};


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
  return { usuario: paciente.usuario, nombre: paciente.nombre };
}

const CAMPOS_ORDENABLES = ["id", "fecha", "zona", "periodo", "sexo"];

export function rutasMediciones(nombre) {
  const router = Router();
  const coleccion = () => getDb().collection(nombre);
  const validar = validadores[nombre];

  router.get("/", async (req, res) => {
    const { _start = "0", _end = "10", _sort = "fecha", _order = "DESC", q, id } = req.query;

    const filtro = { ...filtroAcceso(req.usuario) };
    if (id !== undefined) {
      filtro._id = { $in: [id].flat().map(idValido).filter(Boolean) };
    }
    for (const campo of ["zona", "periodo", "sexo"]) {
      if (typeof req.query[campo] === "string") filtro[campo] = req.query[campo];
    }
    if (req.usuario.rol !== "paciente" && typeof req.query.paciente === "string") {
      filtro["paciente.usuario"] = req.query.paciente;
    }
    if (typeof q === "string" && q.trim()) {
      const re = new RegExp(escaparRegex(q.trim()), "i");
      filtro.$or = [{ zona: re }, { periodo: re }, { sexo: re }, { "paciente.nombre": re }];
    }

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
    const datos = validar(req.body ?? {});
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

    const datos = validar(req.body ?? {});
    const doc = await coleccion().findOneAndUpdate(
      { _id },
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
