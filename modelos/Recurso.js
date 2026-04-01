/**
 * Recurso.js
 * Agrupa los 4 recursos de la ciudad.
 * GAME OVER si electricidad o agua son negativas (< 0).
 * Dinero inicial: $50,000
 */

export class Recurso {

    #money;
    #electricity;
    #water;
    #food;

    static #DINERO_INICIAL = 50000;

    constructor(money, electricity, water, food) {
        this.#money       = money       ?? Recurso.#DINERO_INICIAL;
        this.#electricity = electricity ?? 0;
        this.#water       = water       ?? 0;
        this.#food        = food        ?? 0;
    }

    // ── Getters ─────────────────────────────────────────────
    getMoney()       { return this.#money; }
    getElectricity() { return this.#electricity; }
    getWater()       { return this.#water; }
    getFood()        { return this.#food; }

    // ── Modificadores ────────────────────────────────────────
    addMoney(amount)           { this.#money       += amount; }
    consumeElectricity(amount) { this.#electricity -= amount; }
    consumeWater(amount)       { this.#water       -= amount; }

    /**
     * Aplica produccion y consumo de un turno.
     */
    updateBalance(produccion = {}, consumo = {}) {
        this.#money       += produccion.money       ?? 0;
        this.#electricity += produccion.electricity ?? 0;
        this.#water       += produccion.water       ?? 0;
        this.#food        += produccion.food        ?? 0;

        this.#electricity -= consumo.electricidad ?? 0;
        this.#water       -= consumo.agua         ?? 0;
        this.#food        -= consumo.food         ?? 0;
    }

    // ── Setters directos (configuración en tiempo real) ──────────
    setElectricity(val) { this.#electricity = Number(val) || 0; }
    setWater(val)       { this.#water       = Number(val) || 0; }
    setFood(val)        { this.#food        = Number(val) || 0; }

    /**
     * GAME OVER si cualquier recurso es negativo (< 0).
     */
    isGameOver() {
        return this.#electricity < 0 || this.#water < 0
            || this.#money < 0       || this.#food < 0;
    }

    /** Retorna la causa del game over o null si no hay. */
    getCausaGameOver() {
        if (this.#electricity < 0 && this.#water < 0) return 'electricidad y agua';
        if (this.#electricity < 0) return 'electricidad';
        if (this.#water       < 0) return 'agua';
        if (this.#money       < 0) return 'dinero';
        if (this.#food        < 0) return 'alimentos';
        return null;
    }

    // ── Serialización ────────────────────────────────────────
    toJSON() {
        return {
            money:       this.#money,
            electricity: this.#electricity,
            water:       this.#water,
            food:        this.#food,
        };
    }

    static fromJSON(data) {
        return new Recurso(data.money, data.electricity, data.water, data.food);
    }
}