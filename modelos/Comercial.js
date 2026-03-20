/**
 * Comercial.js
 * Edificio comercial — genera dinero y empleo.
 * Subtipos: 'tienda' | 'centroComercial'
 *
 * Imagenes Simpsons:
 *   tienda          → assets/edificios/kwik_e_mart.png  (Kwik-E-Mart de Apu)
 *   centroComercial → assets/edificios/springfield_mall.png
 */

import { Edificio } from './Edificio.js';

export class Comercial extends Edificio {

  #subtipo;
  #empleos;
  #empleados;
  #ingresosPorTurno;

  static #CONFIG = {
    tienda: {
      costo:              2000,
      costoMantenimiento: 80,
      empleos:            6,
      ingresosPorTurno:   500,
      consumoElectricidad: 8,
      imagen:             '/assets/edificios/kwik_e_mart.png',
      descripcion:        'Kwik-E-Mart: abierto 24/7, como diria Apu',
    },
    centroComercial: {
      costo:              8000,
      costoMantenimiento: 300,
      empleos:            20,
      ingresosPorTurno:   2000,
      consumoElectricidad: 25,
      imagen:             '/assets/edificios/springfield_mall.png',
      descripcion:        'Springfield Mall, el orgullo comercial de la ciudad',
    },
  };

  constructor(id, subtipo, posicion) {
    const config = Comercial.#CONFIG[subtipo];
    if (!config) throw new Error(`Subtipo comercial invalido: "${subtipo}". Usa 'tienda' o 'centroComercial'.`);

    super(id, 'comercial', config.costo, posicion, config.costoMantenimiento);

    this.#subtipo          = subtipo;
    this.#empleos          = config.empleos;
    this.#empleados        = [];
    this.#ingresosPorTurno = config.ingresosPorTurno;
  }

  getSubtipo()            { return this.#subtipo; }
  getEmpleos()            { return this.#empleos; }
  getEmpleados()          { return [...this.#empleados]; }
  getEmpleosDisponibles() { return this.#empleos - this.#empleados.length; }
  getIngresosPorTurno()   { return this.#ingresosPorTurno; }

  asignarEmpleado(ciudadano) {
    if (this.getEmpleosDisponibles() === 0) throw new Error('No hay empleos disponibles');
    this.#empleados.push(ciudadano);
  }

  liberarEmpleado(id) {
    const idx = this.#empleados.findIndex(c => c.getId() === id);
    if (idx !== -1) this.#empleados.splice(idx, 1);
  }

  generarIngresos() {
    // Sin electricidad no genera ingresos
    return this.isActivo() ? this.#ingresosPorTurno : 0;
  }

  // ── @override ───────────────────────────────────────────────

  calcularConsumo() {
    if (!this.isActivo()) return {};
    return { electricidad: Comercial.#CONFIG[this.#subtipo].consumoElectricidad };
  }

  calcularProduccion() {
    if (!this.isActivo()) return {};
    return { money: this.#ingresosPorTurno };
  }

  getInfo() {
    const cfg = Comercial.#CONFIG[this.#subtipo];
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
      ingresosPorTurno:   this.#ingresosPorTurno,
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