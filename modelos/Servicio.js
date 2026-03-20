/**
 * Servicio.js
 * Edificio de servicio — aumenta la felicidad en un radio.
 * Subtipos: 'policia' | 'bomberos' | 'hospital'
 *
 * Imagenes Simpsons:
 *   policia  → assets/edificios/policia_springfield.png  (Comisaria del Jefe Wiggum)
 *   bomberos → assets/edificios/bomberos_springfield.png
 *   hospital → assets/edificios/hospital_springfield.png (Hospital donde trabaja el Dr. Nick)
 */

import { Edificio } from './Edificio.js';

export class Servicio extends Edificio {

  #subtipo;
  #radio;
  #beneficioFelicidad;
  #consumoAgua;

  static #CONFIG = {
    policia: {
      costo:              4000,
      costoMantenimiento: 150,
      radio:              5,
      beneficioFelicidad: 10,
      consumoElectricidad: 15,
      consumoAgua:        0,
      imagen:             '/assets/edificios/policia_springfield.png',
      descripcion:        'Comisaria del Jefe Wiggum — protege (a veces) Springfield',
    },
    bomberos: {
      costo:              4000,
      costoMantenimiento: 150,
      radio:              5,
      beneficioFelicidad: 10,
      consumoElectricidad: 15,
      consumoAgua:        0,
      imagen:             '/assets/edificios/bomberos_springfield.png',
      descripcion:        'Bomberos de Springfield, siempre llegando tarde',
    },
    hospital: {
      costo:              6000,
      costoMantenimiento: 250,
      radio:              7,
      beneficioFelicidad: 10,
      consumoElectricidad: 20,
      consumoAgua:        10,
      imagen:             '/assets/edificios/hospital_springfield.png',
      descripcion:        'Hospital Springfield — "Hi, everybody!" — Dr. Nick',
    },
  };

  constructor(id, subtipo, posicion) {
    const config = Servicio.#CONFIG[subtipo];
    if (!config) throw new Error(`Subtipo de servicio invalido: "${subtipo}". Usa 'policia', 'bomberos' o 'hospital'.`);

    super(id, 'servicio', config.costo, posicion, config.costoMantenimiento);

    this.#subtipo           = subtipo;
    this.#radio             = config.radio;
    this.#beneficioFelicidad = config.beneficioFelicidad;
    this.#consumoAgua       = config.consumoAgua;
  }

  getSubtipo()             { return this.#subtipo; }
  getRadio()               { return this.#radio; }
  getBeneficio()           { return this.#beneficioFelicidad; }
  setBeneficio(valor)      {
    if (typeof valor !== 'number' || valor < 0) throw new Error('El beneficio debe ser un numero positivo');
    this.#beneficioFelicidad = valor;
  }

  // ── @override ───────────────────────────────────────────────

  calcularConsumo() {
    if (!this.isActivo()) return {};
    const cfg = Servicio.#CONFIG[this.#subtipo];
    const consumo = { electricidad: cfg.consumoElectricidad };
    if (cfg.consumoAgua > 0) consumo.agua = cfg.consumoAgua;
    return consumo;
  }

  calcularProduccion() {
    return {}; // El beneficio de felicidad lo aplica ControladorCiudadano
  }

  getInfo() {
    const cfg = Servicio.#CONFIG[this.#subtipo];
    return {
      id:                 this.getId(),
      tipo:               this.getTipo(),
      subtipo:            this.#subtipo,
      costo:              this.getCosto(),
      posicion:           this.getPosicion(),
      activo:             this.isActivo(),
      radio:              this.#radio,
      beneficioFelicidad: this.#beneficioFelicidad,
      imagen:             cfg.imagen,
      descripcion:        cfg.descripcion,
    };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      subtipo:           this.#subtipo,
      radio:             this.#radio,
      beneficioFelicidad: this.#beneficioFelicidad,
    };
  }
}