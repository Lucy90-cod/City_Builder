/**
 * Ciudadano.js
 * Representa un habitante de la ciudad.
 * 
 * Calculo de felicidad (0-100):
 *   +20 tiene vivienda
 *   +15 tiene empleo
 *   +10 por cada servicio cercano (policia, bomberos, hospital)
 *   +5  por cada parque
 *   -20 sin vivienda
 *   -15 sin empleo
 */

export class Ciudadano {

    #id;
    #felicidad;
    #hasHouse;
    #hasJob;
    #edificioResidencialId;
    #edificioTrabajoId;

    static #FELICIDAD_INICIAL = 50;
    static #FELICIDAD_MIN     = 0;
    static #FELICIDAD_MAX     = 100;

    /**
     * @param {string} id
     */
    constructor(id) {
        this.#id                   = id;
        this.#felicidad            = Ciudadano.#FELICIDAD_INICIAL;
        this.#hasHouse             = false;
        this.#hasJob               = false;
        this.#edificioResidencialId = null;
        this.#edificioTrabajoId    = null;
    }

    // ── Getters ─────────────────────────────────────────────
    getId()                    { return this.#id; }
    getFelicidad()             { return this.#felicidad; }
    tieneVivienda()            { return this.#hasHouse; }
    tieneEmpleo()              { return this.#hasJob; }
    getEdificioResidencialId() { return this.#edificioResidencialId; }
    getEdificioTrabajoId()     { return this.#edificioTrabajoId; }

    // ── Vivienda ─────────────────────────────────────────────
    asignarVivienda(edificioId) {
        this.#edificioResidencialId = edificioId;
        this.#hasHouse              = true;
    }

    quedarSinVivienda() {
        this.#edificioResidencialId = null;
        this.#hasHouse              = false;
    }

    // ── Empleo ───────────────────────────────────────────────
    asignarEmpleo(edificioId) {
        this.#edificioTrabajoId = edificioId;
        this.#hasJob            = true;
    }

    quedarSinEmpleo() {
        this.#edificioTrabajoId = null;
        this.#hasJob            = false;
    }

    // ── Felicidad ────────────────────────────────────────────

    /**
     * Recalcula la felicidad segun el contexto de la ciudad.
     * 
     * @param {Object} contexto
     * @param {number} contexto.serviciosCercanos - cantidad de servicios en radio
     * @param {number} contexto.parquesCercanos   - cantidad de parques cercanos
     * @param {number} contexto.beneficioServicio - puntos por servicio (default 10)
     * @param {number} contexto.beneficioParque   - puntos por parque (default 5)
     */
    calcularFelicidad(contexto = {}) {
        let cambio = 0;

        // Factores positivos
        if (this.#hasHouse) cambio += 20;
        if (this.#hasJob)   cambio += 15;

        const beneficioServicio        = contexto.beneficioServicio        ?? 10;
        const beneficioParque          = contexto.beneficioParque          ?? 5;
        const penalizacionSinAlimentos = contexto.penalizacionSinAlimentos ?? 0;
        const servicios                = contexto.serviciosCercanos        ?? 0;
        const parques                  = contexto.parquesCercanos          ?? 0;

        cambio += servicios * beneficioServicio;
        cambio += parques   * beneficioParque;

        // Factores negativos
        if (!this.#hasHouse) cambio -= 20;
        if (!this.#hasJob)   cambio -= 15;
        cambio -= penalizacionSinAlimentos;

        // 🔥 CLAVE: sumar al valor actual (no reemplazar)
        this.#felicidad += cambio * 0.1; // suaviza el cambio

        // Limitar entre 0 y 100
        this.#felicidad = Math.max(
            Ciudadano.#FELICIDAD_MIN,
            Math.min(Ciudadano.#FELICIDAD_MAX, this.#felicidad)
        );
    }

    // ── Serialización ────────────────────────────────────────
    toJSON() {
        return {
            id:                    this.#id,
            felicidad:             this.#felicidad,
            hasHouse:              this.#hasHouse,
            hasJob:                this.#hasJob,
            edificioResidencialId: this.#edificioResidencialId,
            edificioTrabajoId:     this.#edificioTrabajoId,
        };
    }

    static fromJSON(data) {
        const c = new Ciudadano(data.id);
        c.#felicidad = data.felicidad ?? 50;
        if (data.hasHouse && data.edificioResidencialId) {
            c.asignarVivienda(data.edificioResidencialId);
        }
        if (data.hasJob && data.edificioTrabajoId) {
            c.asignarEmpleo(data.edificioTrabajoId);
        }
        return c;
    }
}