//Los 4 tipos de usuario del sistema
export const ROLES = {
  ADMIN: "admin", //ve y hace todo
  COORDINADOR: "coordinador", //solo consulta lo de su región
  ESTANCIA: "estancia", //captura y consulta a los niños de su EBDI
  FAMILIA: "familia", //papá, mamá o tutor: solo los datos de su niño
};

export const LISTA_ROLES = Object.values(ROLES);
