
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";
import { requiereRol } from "../middleware/auth.js";
import { aCliente, escaparRegex, filtroAcceso } from "./mediciones.js";

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

// Une las tres colecciones de mediciones en una sola lista, con el mismo control
// de acceso, búsqueda, orden y paginación. `formato` decide cómo se ve cada renglón:
// Resultados y Historial usan los mismos datos pero con columnas distintas.
function rutaListado(formato) {
  const router = Router();

  router.get("/", async (req, res) => {
    const { _start = "0", _end = "10", _sort = "fecha", _order = "DESC", q, region } = req.query;

    const filtro = {};
    // Filtro por región (solo texto, para que no se pueda inyectar un objeto)
    if (typeof region === "string" && region) filtro.region = region;
    // El control de acceso va AL FINAL: un doctor no puede pedir otra región
    Object.assign(filtro, filtroAcceso(req.usuario));

    const grupos = await Promise.all(
      Object.entries(FUENTES).map(async ([coleccion, fuente]) => {
        const docs = await getDb().collection(coleccion).find(filtro).toArray();
        return docs.map((doc) => {
          const { id, ...d } = aCliente(doc);
          return {
            id: `${coleccion}-${id}`,
            tipo: coleccion,
            nombre: d.paciente?.nombre ?? "(sin paciente)",
            capturadoPor: d.creadoPor?.nombre ?? "",
            titulo: fuente.titulo,
            zona: d.zona,
            region: d.region ?? "",
            periodo: d.periodo,
            sexo: d.sexo,
            contenido: fuente.contenido(d),
            fechaOrden: d.fecha,
          };
        });
      }),
    );

    let filas = grupos.flat();

    if (typeof q === "string" && q.trim()) {
      const re = new RegExp(escaparRegex(q.trim()), "i");
      filas = filas.filter((f) =>
        [f.nombre, f.titulo, f.zona, f.region, f.contenido, f.periodo].some((v) => re.test(v ?? "")),
      );
    }

    const campo = ["nombre", "titulo", "tipo", "zona", "region", "periodo"].includes(_sort) ? _sort : "fechaOrden";
    const signo = _order === "ASC" ? 1 : -1;
    filas.sort((a, b) => (a[campo] > b[campo] ? signo : a[campo] < b[campo] ? -signo : 0));

    const inicio = Math.max(0, Number.parseInt(_start, 10) || 0);
    const fin = Math.min(inicio + 100, Number.parseInt(_end, 10) || inicio + 10);

    res.set("X-Total-Count", String(filas.length)).json(filas.slice(inicio, fin).map(formato));
  });

  return router;
}

// GET /api/resultados — fecha ya formateada como texto
export default rutaListado(({ fechaOrden, ...fila }) => ({ ...fila, fecha: formatearFecha(fechaOrden) }));

// GET /api/historial — fecha en ISO (la pantalla la muestra con <DateField>)
// y el resumen en `resultado`, que es como lo nombra Historial.tsx
export const rutasHistorial = rutaListado(({ fechaOrden, contenido, ...fila }) => ({
  ...fila,
  fecha: fechaOrden,
  resultado: contenido,
}));

// DELETE /api/historial/<tipo>-<id> — botón "Eliminar" del Historial (solo admin).
// El id combina la colección y el _id: "pesoytalla-6ad96914..."
rutasHistorial.delete("/:id", requiereRol("admin"), async (req, res) => {
  const [tipo, idTexto] = req.params.id.split("-");
  if (!(tipo in FUENTES) || !ObjectId.isValid(idTexto)) {
    return res.status(404).json({ error: "No encontrado" });
  }
  const doc = await getDb().collection(tipo).findOneAndDelete({ _id: new ObjectId(idTexto) });
  if (!doc) return res.status(404).json({ error: "No encontrado" });
  res.json({ id: req.params.id });
});
