/**
 * Jugador.js
 * Representa al alcalde — quien controla la ciudad.
 */

export class Jugador {

    #id;
    #nombre;
    #ciudad;    // instancia Ciudad

    /**
     * @param {string} id
     * @param {string} nombre
     */
    constructor(id, nombre) {
        this.#id     = id;
        this.#nombre = nombre;
        this.#ciudad = null;
    }

    // ── Getters ─────────────────────────────────────────────
    getId()     { return this.#id; }
    getNombre() { return this.#nombre; }
    getCiudad() { return this.#ciudad; }

    // ── Setter ──────────────────────────────────────────────
    setCiudad(ciudad) {
        this.#ciudad = ciudad;
    }

    // ── Serialización ───────────────────────────────────────
    toJSON() {
        return {
            id:       this.#id,
            nombre:   this.#nombre,
            ciudadId: this.#ciudad?.getNombre() ?? null,
        };
    }

    static fromJSON(data) {
        return new Jugador(data.id, data.nombre);
    }
}