// Regiones del país (regionalización de Banco de México).
// Debe ser IGUAL a backend/src/regiones.js: el servidor rechaza cualquier otra.
export const REGIONES = ["Norte", "Centro Norte", "Centro", "Sur"];

// Formato de opciones para los filtros de react-admin (SelectInput)
export const OPCIONES_REGION = REGIONES.map((r) => ({ id: r, name: r }));
