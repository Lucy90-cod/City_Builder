// Gestiona la red de caminos del mapa.
// Internamente usa un Set de claves "x,y" para busqueda O(1).
// Un edificio SOLO puede construirse si tiene una via adyacente.

export class Vias {

    #celdas;            // Set<String> — claves con formato "x,y"
    #costoPorCelda;     // Number — siempre $100 segun las reglas del juego
    #totalCeldas;       // Number — redundante con #celdas.size, pero util para toJSON

    constructor() {
        this.#celdas       = new Set();
        this.#costoPorCelda = 100;
        this.#totalCeldas  = 0;
    }

    // ── Clave interna ────────────────────────────────────────────────────────

    #clave(x, y) { return `${x},${y}`; }

    // ── Operaciones sobre el Set ─────────────────────────────────────────────

    agregarCelda(x, y) {
        const clave = this.#clave(x, y);
        if (!this.#celdas.has(clave)) {
            this.#celdas.add(clave);
            this.#totalCeldas++;
        }
    }

    eliminarCelda(x, y) {
        const clave = this.#clave(x, y);
        if (this.#celdas.has(clave)) {
            this.#celdas.delete(clave);
            this.#totalCeldas--;
        }
    }

    existeVia(x, y) {
        return this.#celdas.has(this.#clave(x, y));
    }

    // ── Costos ───────────────────────────────────────────────────────────────

    // Retorna el costo total de construir N celdas de via
    getCostoConstruir(n = 1) {
        return n * this.#costoPorCelda;
    }

    getCostoPorCelda() { return this.#costoPorCelda; }
    getTotalCeldas()   { return this.#celdas.size; }

    // ── Iteracion (util para el renderer y para guardar) ─────────────────────

    // Retorna array de objetos { x, y } para iterar fuera de la clase
    getCeldasComoArray() {
        return [...this.#celdas].map(clave => {
            const [x, y] = clave.split(',').map(Number);
            return { x, y };
        });
    }

    // ── Serializacion ────────────────────────────────────────────────────────

    toJSON() {
        return {
            costoPorCelda: this.#costoPorCelda,
            totalCeldas:   this.#celdas.size,
            celdas:        this.getCeldasComoArray(),   // [{ x, y }, ...]
        };
    }

    // Reconstruye desde JSON (para cargar desde LocalStorage)
    static fromJSON(data) {
        const vias = new Vias();
        if (Array.isArray(data.celdas)) {
            data.celdas.forEach(({ x, y }) => vias.agregarCelda(x, y));
        }
        return vias;
    }
}