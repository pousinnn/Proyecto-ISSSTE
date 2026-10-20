
import { Router } from "express";
import { getDb } from "../db.js";

const router = Router();

//Restringe los resultados que pueden ver los pacientes
router.get("/", async (_req, res) => {
  const pacientes = await getDb()
    .collection("usuarios")
    .find({ rol: "paciente" }, { projection: { _id: 0, usuario: 1, nombre: 1 } })
    .sort({ nombre: 1 })
    .toArray();

  res
    .set("X-Total-Count", String(pacientes.length))
    .json(pacientes.map((p) => ({ id: p.usuario, nombre: p.nombre })));
});

export default router;
