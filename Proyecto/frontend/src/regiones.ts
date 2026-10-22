//Regiones del pais, deben ser iguales a las del backend
export const REGIONES = ["Norte", "Centro Norte", "Centro", "Sur"];

//Opciones de regiones para los filtros
export const OPCIONES_REGION = REGIONES.map((r) => ({ id: r, name: r }));
