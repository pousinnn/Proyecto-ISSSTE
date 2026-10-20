
import { Router } from "express";
import { getDb } from "../db.js";
import { aCliente, escaparRegex, filtroAcceso } from "./mediciones.js";

const router = Router();
//Acomoda y estrae los resultados de la base de datos 
const FUENTES = {
  pesoytalla: {
    titulo: "Peso y talla",
    contenido: (d) => `Edad: ${d.edad} · Peso: ${d.pesoKg} kg · Talla: ${d.alturaCm} cm · IMC: ${d.imc}`,
  },
  tallablanca: {
    titulo: "Talla blanca",
    contenido: (d) =>
      `Padre: ${d.alturaPadreCm} cm · Madre: ${d.alturaMadreCm} cm · Talla blanco: ${d.tallaBlancoCm} cm`,
  },
  perimetrocefalico: {
    titulo: "Perímetro cefálico",
    contenido: (d) => `Perímetro: ${d.perimetroCm} cm`,
  },
};

const formatearFecha = (fecha) =>
  fecha.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short", timeZone: "America/Mexico_City" });

router.get("/", async (req, res) => {
  const { _start = "0", _end = "10", _sort = "fecha", _order = "DESC", q } = req.query;

  const grupos = await Promise.all(
    Object.entries(FUENTES).map(async ([coleccion, fuente]) => {
      const docs = await getDb().collection(coleccion).find(filtroAcceso(req.usuario)).toArray();
      return docs.map((doc) => {
        const { id, ...d } = aCliente(doc);
        return {
          id: `${coleccion}-${id}`,
          tipo: coleccion,
          nombre: d.paciente?.nombre ?? "(sin paciente)",
          capturadoPor: d.creadoPor?.nombre ?? "",
          titulo: fuente.titulo,
          zona: d.zona,
          periodo: d.periodo,
          sexo: d.sexo,
          contenido: fuente.contenido(d),
          fechaOrden: d.fecha,
          fecha: formatearFecha(d.fecha),
        };
      });
    }),
  );

  let filas = grupos.flat();

  if (typeof q === "string" && q.trim()) {
    const re = new RegExp(escaparRegex(q.trim()), "i");
    filas = filas.filter((f) => [f.nombre, f.titulo, f.zona, f.contenido, f.periodo].some((v) => re.test(v ?? "")));
  }

  const campo = ["nombre", "titulo", "zona", "periodo"].includes(_sort) ? _sort : "fechaOrden";
  const signo = _order === "ASC" ? 1 : -1;
  filas.sort((a, b) => (a[campo] > b[campo] ? signo : a[campo] < b[campo] ? -signo : 0));

  const inicio = Math.max(0, Number.parseInt(_start, 10) || 0);
  const fin = Math.min(inicio + 100, Number.parseInt(_end, 10) || inicio + 10);

  res
    .set("X-Total-Count", String(filas.length))
    .json(filas.slice(inicio, fin).map(({ fechaOrden, ...fila }) => fila));
});

export default router;
