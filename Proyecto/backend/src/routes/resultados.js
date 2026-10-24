
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";
import { requiereRol } from "../middleware/auth.js";
import { aCliente, escaparRegex, filtroAcceso, ROLES_QUE_EDITAN, exigirEbdiEstancia } from "./mediciones.js";

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

//Pone la fecha en formato de México
const formatearFecha = (fecha) =>
  fecha.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short", timeZone: "America/Mexico_City" });

//Junta las tres mediciones en una sola lista
function rutaListado(formato) {
  const router = Router();

  router.get("/", async (req, res) => {
    const { _start = "0", _end = "10", _sort = "fecha", _order = "DESC", q, region } = req.query;

    const filtro = {};
    //Filtro por región, solo si es texto
    if (typeof region === "string" && region) filtro.region = region;
    //Al final se aplica el acceso, el doctor no puede pedir otra región (IA)
    Object.assign(filtro, await filtroAcceso(req.usuario));

    //Trae las mediciones de cada colección
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

    //Búsqueda por texto
    if (typeof q === "string" && q.trim()) {
      const re = new RegExp(escaparRegex(q.trim()), "i");
      filas = filas.filter((f) =>
        [f.nombre, f.titulo, f.zona, f.region, f.contenido, f.periodo].some((v) => re.test(v ?? "")),
      );
    }

    //Ordena la lista
    const campo = ["nombre", "titulo", "tipo", "zona", "region", "periodo"].includes(_sort) ? _sort : "fechaOrden";
    const signo = _order === "ASC" ? 1 : -1;
    filas.sort((a, b) => (a[campo] > b[campo] ? signo : a[campo] < b[campo] ? -signo : 0));

    //Regresa solo la página que se pidió
    const inicio = Math.max(0, Number.parseInt(_start, 10) || 0);
    const fin = Math.min(inicio + 100, Number.parseInt(_end, 10) || inicio + 10);

    res.set("X-Total-Count", String(filas.length)).json(filas.slice(inicio, fin).map(formato));
  });

  return router;
}

//Resultados con la fecha ya formateada
export default rutaListado(({ fechaOrden, ...fila }) => ({ ...fila, fecha: formatearFecha(fechaOrden) }));

//Historial con la fecha sin formato y el resumen en resultado
export const rutasHistorial = rutaListado(({ fechaOrden, contenido, ...fila }) => ({
  ...fila,
  fecha: fechaOrden,
  resultado: contenido,
}));

//Borra un registro del historial: solo el admin
rutasHistorial.delete("/:id", requiereRol(...ROLES_QUE_EDITAN), async (req, res) => {
  const [tipo, idTexto] = req.params.id.split("-");
  if (!(tipo in FUENTES) || !ObjectId.isValid(idTexto)) {
    return res.status(404).json({ error: "No encontrado" });
  }
  exigirEbdiEstancia(req.usuario);
  //Si no es de su región o estancia dice que no existe
  const doc = await getDb()
    .collection(tipo)
    .findOneAndDelete({ _id: new ObjectId(idTexto), ...(await filtroAcceso(req.usuario)) });
  if (!doc) return res.status(404).json({ error: "No encontrado" });
  res.json({ id: req.params.id });
});
