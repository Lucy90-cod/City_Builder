/**
 * Industrial.js
 * Edificio industrial — produce dinero o alimentos.
 * Subtipos: 'fabrica' | 'granja'
 *
 * Imagenes Simpsons:
 *   fabrica → assets/edificios/planta_nuclear.png  (Planta Nuclear de Burns)
 *   granja  → assets/edificios/granja_springfield.png
 */

import { Edificio } from './Edificio.js';

export class Industrial extends Edificio {

  #subtipo;
  #empleos;
  #empleados;

  static #CONFIG = {
    fabrica: {
      costo:              5000,
      costoMantenimiento: 200,
      empleos:            15,
      consumoElectricidad: 20,
      consumoAgua:        15,
      produccionMoney:    800,
      imagen:             '/assets/edificios/planta_nuclear.png',
      descripcion:        'La Planta Nuclear de Mr. Burns — peligrosa pero productiva',
    },
    granja: {
      costo:              3000,
      costoMantenimiento: 100,
      empleos:            8,
      consumoElectricidad: 0,
      consumoAgua:        10,
      produccionFood:     50,
      imagen:             '/assets/edificios/granja_springfield.png',
      descripcion:        'Granja organica al estilo Springfield',
    },
  };

  constructor(id, subtipo, posicion) {
    const config = Industrial.#CONFIG[subtipo];
    if (!config) throw new Error(`Subtipo industrial invalido: "${subtipo}". Usa 'fabrica' o 'granja'.`);

    super(id, 'industrial', config.costo, posicion, config.costoMantenimiento);

    this.#subtipo   = subtipo;
    this.#empleos   = config.empleos;
    this.#empleados = [];
  }

  getSubtipo()            { return this.#subtipo; }
  getEmpleos()            { return this.#empleos; }
  getEmpleados()          { return [...this.#empleados]; }
  getEmpleosDisponibles() { return this.#empleos - this.#empleados.length; }

  asignarEmpleado(ciudadano) {
    if (this.getEmpleosDisponibles() === 0) throw new Error('No hay empleos disponibles');
    this.#empleados.push(ciudadano);
  }

  liberarEmpleado(id) {
    const idx = this.#empleados.findIndex(c => c.getId() === id);
    if (idx !== -1) this.#empleados.splice(idx, 1);
  }

  /**
   * Produce recursos. Si faltan insumos (agua/elec) produce al 50%.
   * @param {{ electricidadDisponible: number, aguaDisponible: number }} recursos
   */
  producir(recursos = {}) {
    if (!this.isActivo()) return {};
    const cfg = Industrial.#CONFIG[this.#subtipo];

    // Verificar si hay suficientes recursos — si no, produccion al 50%
    const factor = this.#tieneInsumos(recursos) ? 1 : 0.5;

    if (this.#subtipo === 'fabrica') {
      return { money: Math.floor(cfg.produccionMoney * factor) };
    } else {
      return { food: Math.floor(cfg.produccionFood * factor) };
    }
  }

  #tieneInsumos(recursos) {
    const cfg = Industrial.#CONFIG[this.#subtipo];
    const elecOk = (recursos.electricidadDisponible ?? Infinity) >= cfg.consumoElectricidad;
    const aguaOk = (recursos.aguaDisponible ?? Infinity) >= cfg.consumoAgua;
    return elecOk && aguaOk;
  }

  // ── @override ───────────────────────────────────────────────

  calcularConsumo() {
    if (!this.isActivo()) return {};
    const cfg = Industrial.#CONFIG[this.#subtipo];
    const consumo = {};
    if (cfg.consumoElectricidad > 0) consumo.electricidad = cfg.consumoElectricidad;
    if (cfg.consumoAgua > 0)         consumo.agua = cfg.consumoAgua;
    return consumo;
  }

  calcularProduccion() {
    return this.producir();
  }

  getInfo() {
    const cfg = Industrial.#CONFIG[this.#subtipo];
    return {
      id:                 this.getId(),
      tipo:               this.getTipo(),
      subtipo:            this.#subtipo,
      costo:              this.getCosto(),
      posicion:           this.getPosicion(),
      activo:             this.isActivo(),
      empleos:            this.#empleos,
      empleados:          this.#empleados.length,
      empleosDisponibles: this.getEmpleosDisponibles(),
      imagen:             cfg.imagen,
      descripcion:        cfg.descripcion,
    };
  }

  toJSON() {
    return {
      ...super.toJSON(),
      subtipo:   this.#subtipo,
      empleos:   this.#empleos,
      empleados: this.#empleados.map(c => c.getId()),
    };
  }
}