// Padrón de infantes (solo lectura; los datos llegan con `npm run importar-padron`).
//   GET /api/infantes?_start=0&_end=10&_sort=paterno&_order=ASC&q=texto&ebdi=12&activo=1
//   GET /api/infantes/:id_infante
// Acceso: admin y doctor (se aplica en server.js). Un paciente nunca ve el padrón:
// tiene CURP y datos personales de todos los niños.
import { Router } from "express";
import { getDb } from "../db.js";
import { escaparRegex } from "./mediciones.js";

const router = Router();
const coleccion = () => getDb().collection("infantes");

// Para react-admin el id es id_infante (el mismo número que en MySQL)
const aCliente = ({ _id, ...doc }) => ({ id: doc.id_infante, ...doc });

const CAMPOS_ORDENABLES = ["id", "id_infante", "paterno", "nombre", "fnac", "ebdi", "freg"];

router.get("/", async (req, res) => {
  const { _start = "0", _end = "10", _sort = "paterno", _order = "ASC", q, ebdi, activo, id } = req.query;

  const filtro = {};
  // getMany de react-admin: ?id=1&id=2
  if (id !== undefined) {
    filtro.id_infante = { $in: [id].flat().map(Number).filter(Number.isInteger) };
  }
  // Filtros exactos: se convierten a número, así no se puede inyectar un objeto
  if (typeof ebdi === "string" && /^\d+$/.test(ebdi)) filtro.ebdi = Number(ebdi);
  if (activo === "0" || activo === "1") filtro.activo = Number(activo);

  if (typeof q === "string" && q.trim()) {
    const re = new RegExp(escaparRegex(q.trim()), "i");
    filtro.$or = [{ nombre: re }, { paterno: re }, { materno: re }, { curp: re }];
  }

  const campo = CAMPOS_ORDENABLES.includes(_sort) ? (_sort === "id" ? "id_infante" : _sort) : "paterno";
  const inicio = Math.max(0, Number.parseInt(_start, 10) || 0);
  const limite = Math.min(100, Math.max(1, (Number.parseInt(_end, 10) || 10) - inicio));

  const [docs, total] = await Promise.all([
    coleccion()
      .find(filtro)
      .sort({ [campo]: _order === "DESC" ? -1 : 1, id_infante: 1 })
      .skip(inicio)
      .limit(limite)
      .toArray(),
    coleccion().countDocuments(filtro),
  ]);

  res.set("X-Total-Count", String(total)).json(docs.map(aCliente));
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const doc = Number.isInteger(id) && (await coleccion().findOne({ id_infante: id }));
  if (!doc) return res.status(404).json({ error: "No encontrado" });
  res.json(aCliente(doc));
});

export default router;
