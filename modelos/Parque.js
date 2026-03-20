/**
 * Parque.js
 * Parque — aumenta la felicidad de TODOS los ciudadanos.
 * No tiene subtipos.
 *
 * Imagen Simpsons:
 *   → assets/edificios/parque_springfield.png  (Parque donde Homer se sienta en el sofa)
 */

import { Edificio } from './Edificio.js';

export class Parque extends Edificio {

  #beneficioFelicidad;

  static #COSTO               = 1500;
  static #COSTO_MANTENIMIENTO = 40;
  static #BENEFICIO_DEFAULT   = 5;
  static #IMAGEN              = '/assets/edificios/parque_springfield.png';
  static #DESCRIPCION         = 'Parque de Springfield — donde Homer descansa en el sofa al aire libre';

  /**
   * @param {string} id
   * @param {{x: number, y: number}} posicion
   */
  constructor(id, posicion) {
    super(id, 'parque', Parque.#COSTO, posicion, Parque.#COSTO_MANTENIMIENTO);
    this.#beneficioFelicidad = Parque.#BENEFICIO_DEFAULT;
  }

  getBeneficio()      { return this.#beneficioFelicidad; }
  setBeneficio(valor) {
    if (typeof valor !== 'number' || valor < 0) throw new Error('El beneficio debe ser un numero positivo');
    this.#beneficioFelicidad = valor;
  }

  // ── @override ───────────────────────────────────────────────

  calcularConsumo() {
    return {}; // Los parques no consumen recursos
  }

  calcularProduccion() {
    return {}; // La felicidad la aplica ControladorCiudadano
  }

  getInfo() {
    return {
      id:                 this.getId(),
      tipo:               this.getTipo(),
      subtipo:            'parque',
      costo:              this.getCosto(),
      posicion:           this.getPosicion(),
      activo:             this.isActivo(),
      beneficioFelicidad: this.#beneficioFelicidad,
      imagen:             Parque.#IMAGEN,
      descripcion:        Parque.#DESCRIPCION,
    };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      beneficioFelicidad: this.#beneficioFelicidad,
    };
  }
}