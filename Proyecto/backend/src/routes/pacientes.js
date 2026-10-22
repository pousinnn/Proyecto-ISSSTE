
import { Router } from "express";
import { familiasDe, filtroInfantes } from "./mediciones.js";

const router = Router();

//Lista de niños para el selector al capturar: el admin ve todos, la estancia solo los de su EBDI
router.get("/", async (req, res) => {
  const pacientes = await familiasDe(filtroInfantes(req.usuario));

  res
    .set("X-Total-Count", String(pacientes.length))
    .json(pacientes.map((p) => ({ id: p.usuario, nombre: p.nombre })));
});

export default router;
