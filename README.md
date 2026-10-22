# Proyecto-ISSSTE
Proyecto para integración de seguridad informática en redes y sistemas de software:

Nicolas Casillas Larrañaga | A01787292 

Paulina Cortez Balvanera | A01782041 

María Espínola Forcén | A01787172

## Profesores

- Ahmed Imad Hammoodi AL-Jarah
- Edith Carolina Arias Serna
- Lizbeth Peralta Malváez
- Carlos Enrique Vega Álvarez
- Jorge Rodríguez Ruiz

Inicio de proyecto: 07/10/2026

## ¿Qué es?

Panel para registrar y consultar mediciones de crecimiento de los niños de las estancias del ISSSTE (EBDI): **Peso y Talla**, **Talla Blanco** y **Perímetro Cefálico**, además de **Resultados**, **Historial** y el **Padrón** de infantes.

**Tecnologías:** React + react-admin (frontend) · Node.js + Express (API) · MongoDB (base de datos)

```
Proyecto/
├── frontend/   página web (puerto 5173)
└── backend/    API que conecta la página con MongoDB (puerto 3000)
```

## Cómo correrlo

**Necesitas:** [Node.js](https://nodejs.org) 20 o mayor y [MongoDB Community Server](https://www.mongodb.com/try/download/community) instalado como servicio.

**1. Backend**
```powershell
cd Proyecto\backend
npm install
Copy-Item .env.example .env
```
Abre `.env` y en `JWT_SECRET` pon una clave larga. Puedes generarla con:
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Luego arranca el API:
```powershell
npm run dev
```

**2. Frontend** (en otra terminal)
```powershell
cd Proyecto\frontend
npm install
npm run dev
```
Abre http://localhost:5173

## Base de datos

Cada quien tiene su propia base local (`issste`). Para cargar un respaldo que te pasen (no se sube a GitHub):
```powershell
& "C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe" --db issste --drop RUTA\issste
```
Necesita las [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools). `--drop` reemplaza lo que ya tengas.

Comandos útiles (desde `Proyecto/backend`):

| Comando | Para qué |
|---|---|
| `npm run crear-usuario -- <usuario> "<Nombre>" <contraseña> <rol> ["<región>"]` | Crear una cuenta (la región solo para doctor) |
| `npm run asignar-region -- <usuario> "<región>"` | Cambiar la región de un doctor |
| `npm run importar-padron -- <archivo.sql> [--aplicar]` | Importar el padrón de MySQL (sin `--aplicar` solo revisa) |
| `npm run datos-demo` / `-- --borrar` | Crear o borrar datos falsos para probar |

## Roles

| Rol | Qué puede hacer |
|---|---|
| **Admin** | Todo: ve todas las regiones, crea usuarios y borra registros |
| **Doctor** | Solo ve y captura a los pacientes de **su región** |
| **Paciente** | Solo ve y captura **sus propias** mediciones |

Regiones: Norte, Centro Norte, Centro y Sur.

## Seguridad

- Contraseñas guardadas con **Argon2id** (nunca en texto plano).
- Sesión con **token JWT** firmado que expira en 1 hora.
- Límite de **10 intentos de login** cada 15 minutos.
- El servidor revisa **rol y región** en cada petición: nadie puede ver datos ajenos cambiando la URL.
- Todos los datos se **validan en el servidor** (tipos, rangos, CURP) y los cálculos (IMC, talla blanco) se hacen ahí.
- Protección contra **inyección NoSQL**, encabezados seguros (**Helmet**) y **CORS** limitado a la página.
- `.env`, respaldos y contraseñas **no se suben** a GitHub.
