'use strict';

/**
 * Adaptador para convertir datos de BD (snake_case) a formato frontend (camelCase)
 */

function convertirVueloAlFormato(vuelo) {
  if (!vuelo) return null;

  return {
    id: vuelo.id,
    codigoVuelo: vuelo.codigo_vuelo,
    ciudadOrigen: vuelo.ciudad_origen,
    ciudadDestino: vuelo.ciudad_destino,
    fechaSalida: vuelo.fecha_salida,
    horaSalida: vuelo.hora_salida,
    fechaLlegada: vuelo.fecha_llegada,
    horaLlegada: vuelo.hora_llegada,
    capacidad: vuelo.capacidad,
    precioBase: vuelo.precio_base,
    estado: vuelo.estado,
    imagen: vuelo.imagen
  };
}

function convertirVuelosAlFormato(vuelos) {
  return vuelos.map(convertirVueloAlFormato);
}

module.exports = {
  convertirVueloAlFormato,
  convertirVuelosAlFormato
};
