
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { conectar } from "./db.js";
import { requiereLogin, requiereRol } from "./middleware/auth.js";
import rutasAuth from "./routes/auth.js";
import rutasResultados from "./routes/resultados.js";
import rutasPacientes from "./routes/pacientes.js";
import rutasInfantes from "./routes/infantes.js";
import rutasUsuarios from "./routes/usuarios.js";
import { rutasMediciones } from "./routes/mediciones.js";
import { ErrorValidacion } from "./validaciones.js";

//Api que conecta mongodb con la página de admin

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("Falta JWT_SECRET en .env (mínimo 32 caracteres). Revisa .env.example");
  process.exit(1);
}

const app = express();

app.use(helmet());


app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    exposedHeaders: ["X-Total-Count"],
  }),
);


app.use(express.json({ limit: "20kb" }));


app.get("/api/salud", (_req, res) => res.json({ ok: true }));
app.use("/api", rutasAuth);


app.use("/api", requiereLogin);
app.use("/api/resultados", rutasResultados);
app.use("/api/pacientes", requiereRol("admin", "doctor"), rutasPacientes);
app.use("/api/infantes", requiereRol("admin", "doctor"), rutasInfantes);
app.use("/api/users", requiereRol("admin"), rutasUsuarios);
for (const recurso of ["pesoytalla", "tallablanca", "perimetrocefalico"]) {
  app.use(`/api/${recurso}`, rutasMediciones(recurso));
}

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));


app.use((err, _req, res, _next) => {
  if (err instanceof ErrorValidacion) {
    // 400 por defecto; algunos errores traen su propio código (ej. 403)
    return res.status(err.status ?? 400).json({ error: err.message });
  }
  if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
    return res.status(400).json({ error: "Cuerpo de la petición inválido" });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const puerto = Number(process.env.PORT ?? 3000);

await conectar();
app.listen(puerto, () => {
  console.log(`API escuchando en http://localhost:${puerto}/api`);
});
