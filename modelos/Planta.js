/**
 * Planta.js
 * Planta de utilidad — produce electricidad o agua.
 * Subtipos: 'electrica' | 'agua'
 *
 * Imagenes Simpsons:
 *   electrica → assets/edificios/planta_electrica.png  (Torres de enfriamiento nucleares)
 *   agua      → assets/edificios/planta_agua.png
 */

import { Edificio } from './Edificio.js';

export class Planta extends Edificio {

  #subtipo;
  #produccionPorTurno;
  #tipoRecurso;

  static #CONFIG = {
    electrica: {
      costo:              10000,
      costoMantenimiento: 400,
      produccionPorTurno: 200,
      tipoRecurso:        'electricity',
      consumoElectricidad: 0,
      imagen:             '/assets/edificios/planta_electrica.png',
      descripcion:        'Torres de enfriamiento de Springfield — propiedad de Mr. Burns',
    },
    agua: {
      costo:              8000,
      costoMantenimiento: 300,
      produccionPorTurno: 150,
      tipoRecurso:        'water',
      consumoElectricidad: 20,
      imagen:             '/assets/edificios/planta_agua.png',
      descripcion:        'Planta de agua potable de Springfield',
    },
  };

  constructor(id, subtipo, posicion) {
    const config = Planta.#CONFIG[subtipo];
    if (!config) throw new Error(`Subtipo de planta invalido: "${subtipo}". Usa 'electrica' o 'agua'.`);

    super(id, 'planta', config.costo, posicion, config.costoMantenimiento);

    this.#subtipo           = subtipo;
    this.#produccionPorTurno = config.produccionPorTurno;
    this.#tipoRecurso       = config.tipoRecurso;
  }

  getSubtipo()           { return this.#subtipo; }
  getProduccion()        { return this.#produccionPorTurno; }
  getTipoRecurso()       { return this.#tipoRecurso; }

  // ── @override ───────────────────────────────────────────────

  calcularConsumo() {
    if (!this.isActivo()) return {};
    const cfg = Planta.#CONFIG[this.#subtipo];
    if (cfg.consumoElectricidad > 0) return { electricidad: cfg.consumoElectricidad };
    return {};
  }

  calcularProduccion() {
    if (!this.isActivo()) return {};
    return { [this.#tipoRecurso]: this.#produccionPorTurno };
  }

  getInfo() {
    const cfg = Planta.#CONFIG[this.#subtipo];
    return {
      id:                 this.getId(),
      tipo:               this.getTipo(),
      subtipo:            this.#subtipo,
      costo:              this.getCosto(),
      posicion:           this.getPosicion(),
      activo:             this.isActivo(),
      produccionPorTurno: this.#produccionPorTurno,
      tipoRecurso:        this.#tipoRecurso,
      imagen:             cfg.imagen,
      descripcion:        cfg.descripcion,
    };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      subtipo:            this.#subtipo,
      produccionPorTurno: this.#produccionPorTurno,
      tipoRecurso:        this.#tipoRecurso,
    };
  }
}