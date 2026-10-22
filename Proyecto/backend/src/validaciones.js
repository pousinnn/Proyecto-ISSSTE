import { REGIONES } from "./regiones.js";

//Validar que la información proporcionada por el usuario
export class ErrorValidacion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.status = 400;
  }
}

const SEXOS = ["niño", "niña"];
const PERIODOS = ["2026-1", "2026-2", "2027-1"];

const elegir = (valor, opciones, campo) => {
  if (!opciones.includes(valor)) {
    throw new ErrorValidacion(`${campo} debe ser uno de: ${opciones.join(", ")}`);
  }
  return valor;
};

const numeroPositivo = (valor, campo) => {
  const n = Number(valor);
  if (typeof valor === "boolean" || valor === "" || valor === null || !Number.isFinite(n) || n <= 0) {
    throw new ErrorValidacion(`${campo} debe ser un número mayor a 0`);
  }
  return n;
};

const enRango = (valor, min, max, campo) => {
  if (valor < min || valor > max) {
    throw new ErrorValidacion(`${campo} fuera de rango (${min} a ${max})`);
  }
  return valor;
};

const texto = (valor, campo, max = 100) => {
  if (typeof valor !== "string" || valor.trim() === "" || valor.length > max) {
    throw new ErrorValidacion(`${campo} es obligatorio (máximo ${max} caracteres)`);
  }
  return valor.trim();
};

const fechaPasada = (valor, campo) => {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new ErrorValidacion(`${campo} debe tener formato AAAA-MM-DD`);
  }
  const fecha = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(fecha.getTime()) || fecha > new Date()) {
    throw new ErrorValidacion(`${campo} no es una fecha válida`);
  }
  return valor;
};

const redondear = (n) => Number(n.toFixed(2));

const aCm = (valor, unidad) =>
  ({ mm: valor / 10, cm: valor, m: valor * 100, in: valor * 2.54 })[unidad];

const edadEnMeses = (fechaNacimiento) => {
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  const hoy = new Date();
  let meses =
    (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth());
  if (hoy.getDate() < nacimiento.getDate()) meses--;
  return meses;
};


const comunes = (d) => ({
  sexo: elegir(d.sexo, SEXOS, "sexo"),
  periodo: elegir(d.periodo, PERIODOS, "periodo"),
  region: elegir(d.region, REGIONES, "region"),
  zona: texto(d.zona, "zona"),
});

export const validadores = {
  pesoytalla(d) {
    const fechaNacimiento = fechaPasada(d.fechaNacimiento, "fechaNacimiento");
    const unidadAltura = elegir(d.unidadAltura, ["cm", "m"], "unidadAltura");
    const unidadPeso = elegir(d.unidadPeso, ["kg", "lb"], "unidadPeso");
    const altura = numeroPositivo(d.altura, "altura");
    const peso = numeroPositivo(d.peso, "peso");

    const alturaCm = enRango(aCm(altura, unidadAltura), 30, 250, "altura");
    const pesoKg = enRango(unidadPeso === "lb" ? peso * 0.45359237 : peso, 0.5, 300, "peso");
    const edadMeses = enRango(edadEnMeses(fechaNacimiento), 0, 18 * 12, "edad");

    return {
      ...comunes(d),
      fechaNacimiento,
      altura,
      unidadAltura,
      peso,
      unidadPeso,
      alturaCm: redondear(alturaCm),
      pesoKg: redondear(pesoKg),
      edadMeses,
      edad: `${Math.floor(edadMeses / 12)} años y ${edadMeses % 12} meses`,
      imc: redondear(pesoKg / (alturaCm / 100) ** 2),
    };
  },

  tallablanca(d) {
    const base = comunes(d);
    const unidadPadre = elegir(d.unidadPadre, ["cm", "m", "in"], "unidadPadre");
    const unidadMadre = elegir(d.unidadMadre, ["cm", "m", "in"], "unidadMadre");
    const alturaPadre = numeroPositivo(d.alturaPadre, "alturaPadre");
    const alturaMadre = numeroPositivo(d.alturaMadre, "alturaMadre");

    const padreCm = enRango(aCm(alturaPadre, unidadPadre), 100, 250, "alturaPadre");
    const madreCm = enRango(aCm(alturaMadre, unidadMadre), 100, 250, "alturaMadre");

    const ajuste = base.sexo === "niño" ? 13 : -13;

    return {
      ...base,
      alturaPadre,
      unidadPadre,
      alturaMadre,
      unidadMadre,
      alturaPadreCm: redondear(padreCm),
      alturaMadreCm: redondear(madreCm),
      tallaBlancoCm: redondear((padreCm + madreCm + ajuste) / 2),
    };
  },

  perimetrocefalico(d) {
    const unidad = elegir(d.unidad, ["cm", "mm", "m", "in"], "unidad");
    const perimetro = numeroPositivo(d.perimetro, "perimetro");
    const perimetroCm = enRango(aCm(perimetro, unidad), 20, 70, "perimetro");

    return {
      ...comunes(d),
      perimetro,
      unidad,
      perimetroCm: redondear(perimetroCm),
    };
  },
};
