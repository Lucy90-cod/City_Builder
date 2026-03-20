// Value Object — unidad minima del mapa.
// Una celda SIEMPRE tiene coordenadas fijas (x, y).
// Su tipo puede cambiar segun lo que el jugador construya encima.
// Convenciones de tipo (para cargar desde archivo .txt):
//   'grass'    → terreno vacio  (g)
//   'road'     → via/camino     (r)
//   'building' → edificio       (R1, C1, I1, S1, U1, P1 ...)

export class Celda {

    #x;             // Number — columna
    #y;             // Number — fila
    #tipo;          // 'grass' | 'road' | 'building'
    #edificioId;    // String | null — id del edificio si tipo === 'building'

    constructor(x, y, tipo = 'grass', edificioId = null) {
        this.#x          = x;
        this.#y          = y;
        this.#tipo       = tipo;
        this.#edificioId = edificioId;
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    getX()          { return this.#x; }
    getY()          { return this.#y; }
    getTipo()       { return this.#tipo; }
    getEdificioId() { return this.#edificioId; }

    // ── Consultas de estado ──────────────────────────────────────────────────

    isEmpty()  { return this.#tipo === 'grass'; }
    isVia()    { return this.#tipo === 'road'; }
    isEdificio() { return this.#tipo === 'building'; }

    // ── Mutaciones ───────────────────────────────────────────────────────────

    setTipo(tipo) {
        const validos = ['grass', 'road', 'building'];
        if (!validos.includes(tipo)) {
            throw new Error(`Tipo de celda invalido: "${tipo}". Usa: ${validos.join(', ')}`);
        }
        this.#tipo = tipo;
    }

    setEdificioId(id) {
        this.#edificioId = id ?? null;
    }

    // Convierte la celda a terreno vacio (demolicion o eliminacion de via)
    vaciar() {
        this.#tipo       = 'grass';
        this.#edificioId = null;
    }

    // Coloca un edificio en la celda
    ocuparConEdificio(edificioId) {
        this.#tipo       = 'building';
        this.#edificioId = edificioId;
    }

    // Coloca una via en la celda
    ocuparConVia() {
        this.#tipo       = 'road';
        this.#edificioId = null;
    }

    // ── Serializacion ────────────────────────────────────────────────────────

    toJSON() {
        return {
            x:          this.#x,
            y:          this.#y,
            tipo:       this.#tipo,
            edificioId: this.#edificioId,
        };
    }

    // Reconstruye una instancia desde un objeto JSON plano (para LocalStorage)
    static fromJSON(data) {
        return new Celda(data.x, data.y, data.tipo, data.edificioId);
    }
}