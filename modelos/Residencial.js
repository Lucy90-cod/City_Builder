/**
 * Residencial.js
 * Edificio residencial — vivienda para ciudadanos.
 * Subtipos: 'casa' | 'apartamento'
 *
 * Imagenes Simpsons:
 *   casa        → assets/edificios/casa_simpsons.png   (casa amarilla de los Simpson)
 *   apartamento → assets/edificios/apartamento_simpsons.png
 */

import { Edificio } from './Edificio.js';

export class Residencial extends Edificio {

  // ── Atributos privados propios ──────────────────────────────
  #subtipo;
  #capacidad;
  #ocupantes;

  // Configuracion por subtipo
  static #CONFIG = {
    casa: {
      costo:              1000,
      costoMantenimiento: 50,
      capacidad:          4,
      consumoElectricidad: 5,
      consumoAgua:         3,
      imagen:             '/assets/edificios/casa_simpsons.png',
      descripcion:        'La tipica casa amarilla de Springfield',
    },
    apartamento: {
      costo:              3000,
      costoMantenimiento: 120,
      capacidad:          12,
      consumoElectricidad: 15,
      consumoAgua:         10,
      imagen:             '/assets/edificios/apartamento_simpsons.png',
      descripcion:        'Edificio de apartamentos al estilo Springfield',
    },
  };

  /**
   * @param {string} id
   * @param {'casa'|'apartamento'} subtipo
   * @param {{x: number, y: number}} posicion
   */
  constructor(id, subtipo, posicion) {
    const config = Residencial.#CONFIG[subtipo];
    if (!config) throw new Error(`Subtipo residencial invalido: "${subtipo}". Usa 'casa' o 'apartamento'.`);

    super(id, 'residencial', config.costo, posicion, config.costoMantenimiento);

    this.#subtipo    = subtipo;
    this.#capacidad  = config.capacidad;
    this.#ocupantes  = [];
  }

  // ── Getters propios ─────────────────────────────────────────
  getSubtipo()    { return this.#subtipo; }
  getCapacidad()  { return this.#capacidad; }
  getOcupantes()  { return [...this.#ocupantes]; }
  getDisponible() { return this.#capacidad - this.#ocupantes.length; }

  // ── Metodos propios ─────────────────────────────────────────

  agregarOcupante(ciudadano) {
    if (this.getDisponible() === 0) throw new Error('Edificio residencial lleno');
    this.#ocupantes.push(ciudadano);
  }

  quitarOcupante(id) {
    const idx = this.#ocupantes.findIndex(c => c.getId() === id);
    if (idx !== -1) this.#ocupantes.splice(idx, 1);
  }

  // ── @override metodos abstractos ───────────────────────────

  calcularConsumo() {
    if (!this.isActivo()) return {};
    const cfg = Residencial.#CONFIG[this.#subtipo];
    return {
      electricidad: cfg.consumoElectricidad,
      agua:         cfg.consumoAgua,
    };
  }

  calcularProduccion() {
    return {}; // Los residenciales no producen recursos
  }

  getInfo() {
    const cfg = Residencial.#CONFIG[this.#subtipo];
    return {
      id:          this.getId(),
      tipo:        this.getTipo(),
      subtipo:     this.#subtipo,
      costo:       this.getCosto(),
      posicion:    this.getPosicion(),
      activo:      this.isActivo(),
      capacidad:   this.#capacidad,
      ocupantes:   this.#ocupantes.length,
      disponible:  this.getDisponible(),
      imagen:      cfg.imagen,
      descripcion: cfg.descripcion,
    };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      subtipo:   this.#subtipo,
      capacidad: this.#capacidad,
      ocupantes: this.#ocupantes.map(c => c.getId()),
    };
  }
}