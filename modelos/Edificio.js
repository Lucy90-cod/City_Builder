// modelos/Edificio.js
// CLASE ABSTRACTA — base de toda la jerarquia de edificios
// No puede instanciarse directamente

export class Edificio {

    // Atributos privados
    #id;
    #tipo;
    #costo;
    #posicion;
    #activo;
    #costoMantenimiento;

    constructor(id, tipo, costo, posicion, costoMantenimiento = 0) {
        // Bloquear instanciacion directa de Edificio
        if (new.target === Edificio) {
            throw new Error('Edificio es una clase abstracta y no puede instanciarse directamente. Usa una subclase como Residencial, Comercial, etc.');
        }

        this.#id                  = id;
        this.#tipo                = tipo;
        this.#costo               = costo;
        this.#posicion            = posicion;   // { x: Number, y: Number }
        this.#activo              = true;
        this.#costoMantenimiento  = costoMantenimiento;
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    getId()                   { return this.#id; }
    getTipo()                 { return this.#tipo; }
    getCosto()                { return this.#costo; }
    getPosicion()             { return { ...this.#posicion }; }
    isActivo()                { return this.#activo; }
    /** 0.01% del costo de construccion por turno */
    getCostoMantenimiento()   { return Math.round(this.#costo * 0.0001); }

    // ── Setter ───────────────────────────────────────────────────────────────

    setActivo(valor) {
        this.#activo = Boolean(valor);
    }

    // ── Metodos abstractos ───────────────────────────────────────────────────
    // Las subclases DEBEN sobreescribir estos tres metodos.
    

    calcularConsumo() {
        throw new Error(`${this.constructor.name} debe implementar calcularConsumo()`);
    }

    calcularProduccion() {
        throw new Error(`${this.constructor.name} debe implementar calcularProduccion()`);
    }

    getInfo() {
        throw new Error(`${this.constructor.name} debe implementar getInfo()`);
    }

    // ── Utilidad base (disponible para todas las subclases) ──────────────────

    toJSON() {
        return {
            id:                 this.#id,
            tipo:               this.#tipo,
            costo:              this.#costo,
            posicion:           this.#posicion,
            activo:             this.#activo,
            costoMantenimiento: this.#costoMantenimiento,
        };
    }
}