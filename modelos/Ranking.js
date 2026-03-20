/**
 * Ranking.js
 * Top 10 ciudades ordenadas por score descendente.
 * Persiste entre sesiones via RankingStorage.
 */

export class Ranking {

    #entradas;      // Array de { ciudadId, nombre, alcalde, score, turno, fecha }
    #maxEntradas;

    static #MAX_DEFAULT = 10;

    constructor(maxEntradas = Ranking.#MAX_DEFAULT) {
        this.#entradas   = [];
        this.#maxEntradas = maxEntradas;
    }

    // ── Getters ──────────────────────────────────────────────
    getEntradas()    { return [...this.#entradas]; }
    getMaxEntradas() { return this.#maxEntradas; }

    // ── Agregar ──────────────────────────────────────────────

    /**
     * Agrega o actualiza la entrada de una ciudad.
     * Si ya existe la ciudad, actualiza su score si es mayor.
     * Mantiene maximo 10 entradas ordenadas.
     * @param {Object} ciudad - instancia Ciudad con getEstado()
     */
    agregarEntrada(ciudad) {
        const estado = ciudad.getEstado();
        const entrada = {
            ciudadId: ciudad.getNombre() + '_' + ciudad.getNombreAlcalde(),
            nombre:   estado.nombre,
            alcalde:  estado.nombreAlcalde,
            score:    estado.score,
            turno:    estado.turnoActual,
            fecha:    new Date().toLocaleDateString('es-CO'),
        };

        // Buscar si ya existe esta ciudad
        const idx = this.#entradas.findIndex(e => e.ciudadId === entrada.ciudadId);

        if (idx !== -1) {
            // Solo actualizar si el nuevo score es mayor
            if (entrada.score > this.#entradas[idx].score) {
                this.#entradas[idx] = entrada;
            }
        } else {
            this.#entradas.push(entrada);
        }

        this.ordenar();

        // Mantener solo el top N
        if (this.#entradas.length > this.#maxEntradas) {
            this.#entradas = this.#entradas.slice(0, this.#maxEntradas);
        }
    }

    // ── Consultas ────────────────────────────────────────────

    /** Retorna las top 10 entradas ordenadas por score */
    getTop10() {
        return [...this.#entradas];
    }

    /**
     * Retorna la posicion (1-based) de una ciudad en el ranking.
     * Retorna -1 si no esta en el ranking.
     * @param {string} ciudadId
     */
    getPosicion(ciudadId) {
        const idx = this.#entradas.findIndex(e => e.ciudadId === ciudadId);
        return idx === -1 ? -1 : idx + 1;
    }

    // ── Ordenar ──────────────────────────────────────────────

    /** Ordena las entradas por score descendente */
    ordenar() {
        this.#entradas.sort((a, b) => b.score - a.score);
    }

    // ── Limpiar ──────────────────────────────────────────────
    limpiar() {
        this.#entradas = [];
    }

    // ── Serialización ────────────────────────────────────────
    toJSON() {
        return {
            entradas:    this.#entradas,
            maxEntradas: this.#maxEntradas,
        };
    }

    static fromJSON(data) {
        const r = new Ranking(data.maxEntradas ?? 10);
        r.#entradas = data.entradas ?? [];
        return r;
    }
}