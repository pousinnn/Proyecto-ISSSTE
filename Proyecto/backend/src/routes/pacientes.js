
import { Router } from "express";
import { getDb } from "../db.js";
import { pacientesDeRegion } from "./mediciones.js";

const router = Router();

//Lista de pacientes para el selector: el admin ve todos, el doctor solo los de su región
router.get("/", async (req, res) => {
  let pacientes;
  if (req.usuario.rol === "doctor") {
    pacientes = req.usuario.region ? await pacientesDeRegion(req.usuario.region) : [];
  } else {
    pacientes = await getDb()
      .collection("usuarios")
      .find({ rol: "paciente" }, { projection: { _id: 0, usuario: 1, nombre: 1 } })
      .sort({ nombre: 1 })
      .toArray();
  }

  res
    .set("X-Total-Count", String(pacientes.length))
    .json(pacientes.map((p) => ({ id: p.usuario, nombre: p.nombre })));
});

export default router;
