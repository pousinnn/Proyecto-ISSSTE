//Rutas del padrón de infantes, solo para admin y doctor
import { Router } from "express";
import { getDb } from "../db.js";
import { escaparRegex, filtroInfantes } from "./mediciones.js";
import { requiereRol } from "../middleware/auth.js";
import { REGIONES } from "../regiones.js";
import { ErrorValidacion } from "../validaciones.js";

const router = Router();
const coleccion = () => getDb().collection("infantes");

//Usa id_infante como id para la página de admin
const aCliente = ({ _id, ...doc }) => ({ id: doc.id_infante, ...doc });

//Campos por los que se puede ordenar
const CAMPOS_ORDENABLES = ["id", "id_infante", "paterno", "nombre", "fnac", "ebdi", "freg"];

//Lista de infantes con filtros y páginas
router.get("/", async (req, res) => {
  const { _start = "0", _end = "10", _sort = "paterno", _order = "ASC", q, ebdi, activo, region, id } = req.query;

  const filtro = {};
  //Busca varios infantes por id
  if (id !== undefined) {
    filtro.id_infante = { $in: [id].flat().map(Number).filter(Number.isInteger) };
  }
  //Filtros, se pasan a número para que sean seguros
  if (typeof ebdi === "string" && /^\d+$/.test(ebdi)) filtro.ebdi = Number(ebdi);
  if (activo === "0" || activo === "1") filtro.activo = Number(activo);
  if (typeof region === "string" && REGIONES.includes(region)) filtro.region = region;

  //Búsqueda por nombre, apellidos o CURP
  if (typeof q === "string" && q.trim()) {
    const re = new RegExp(escaparRegex(q.trim()), "i");
    filtro.$or = [{ nombre: re }, { paterno: re }, { materno: re }, { curp: re }];
  }
  //El doctor solo ve los infantes de su región
  Object.assign(filtro, filtroInfantes(req.usuario));
  //Orden y páginas

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

//Ver un infante por su id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  //Si es de otra región dice que no existe
  const doc = Number.isInteger(id) && (await coleccion().findOne({ id_infante: id, ...filtroInfantes(req.usuario) }));
  if (!doc) return res.status(404).json({ error: "No encontrado" });
  res.json(aCliente(doc));
});

//Cambia la región de un infante, solo admin
router.put("/:id/region", requiereRol("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const region = req.body?.region;
  if (!REGIONES.includes(region)) {
    throw new ErrorValidacion(`region debe ser una de: ${REGIONES.join(", ")}`);
  }
  const doc =
    Number.isInteger(id) &&
    (await coleccion().findOneAndUpdate({ id_infante: id }, { $set: { region } }, { returnDocument: "after" }));
  if (!doc) return res.status(404).json({ error: "No encontrado" });
  res.json(aCliente(doc));
});

export default router;
