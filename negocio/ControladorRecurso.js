/**
 * Calcula produccion y consumo de todos los edificios cada turno.
 * Usa polimorfismo — llama calcularProduccion() y calcularConsumo()
 * sin saber el tipo de edificio.
 *
 * Tambien aplica consumo de alimentos por ciudadano (3 food/ciudadano/turno).
 * Guarda los totales del ultimo turno para que PanelRecursos pueda
 * mostrar el formato "produccion / consumo" en la vista.
 */

export class ControladorRecurso {

    #ciudad;

    // Totales del ultimo turno (para mostrar en la vista)
    #ultimaProduccion = { money: 0, electricity: 0, water: 0, food: 0 };
    #ultimoConsumo    = { electricidad: 0, agua: 0, food: 0 };
    /** Suma de mantenimiento descontado en el ultimo paso 3 del turno */
    #ultimoMantenimientoDinero = 0;

    // Consumo de alimentos por ciudadano por turno (configurable en el futuro)
    static #FOOD_POR_CIUDADANO = 3;

    constructor(ciudad) {
        this.#ciudad = ciudad;
    }

    /**
     * Suma la produccion de todos los edificios activos
     * y la aplica al recurso de la ciudad.
     * Paso 1 de ejecutarTurno().
     */
    calcularProduccion() {
        const recurso   = this.#ciudad.getRecurso();
        const edificios = this.#ciudad.getEdificios();

        // Pasar balance actual para que industriales reduzcan al 50% si faltan insumos
        const recursosActuales = {
            electricidadDisponible: recurso.getElectricity(),
            aguaDisponible:         recurso.getWater(),
        };

        const totalProduccion = { money: 0, electricity: 0, water: 0, food: 0 };

        edificios.forEach(e => {
            if (!e.isActivo()) return;
            const prod = e.calcularProduccion(recursosActuales);
            totalProduccion.money       += prod.money       ?? 0;
            totalProduccion.electricity += prod.electricity ?? 0;
            totalProduccion.water       += prod.water       ?? 0;
            totalProduccion.food        += prod.food        ?? 0;
        });

        // Guardar para la vista
        this.#ultimaProduccion = { ...totalProduccion };

        recurso.updateBalance(totalProduccion, {});
    }

    /**
     * Suma el consumo de todos los edificios activos y de ciudadanos,
     * y lo descuenta del recurso.
     * Paso 2 de ejecutarTurno().
     * @returns {string|null} causa del game over o null si no lo hay
     */
    calcularConsumo() {
        const recurso   = this.#ciudad.getRecurso();
        const edificios = this.#ciudad.getEdificios();

        const totalConsumo = { electricidad: 0, agua: 0, food: 0 };

        edificios.forEach(e => {
            if (!e.isActivo()) return;
            const consumo = e.calcularConsumo();
            totalConsumo.electricidad += consumo.electricidad ?? 0;
            totalConsumo.agua         += consumo.agua         ?? 0;
        });

        // Ciudadanos consumen alimentos cada turno
        const numCiudadanos = this.#ciudad.getCiudadanos().length;
        totalConsumo.food = numCiudadanos * ControladorRecurso.#FOOD_POR_CIUDADANO;

        // Guardar para la vista
        this.#ultimoConsumo = { ...totalConsumo };

        recurso.updateBalance({}, totalConsumo);
        return recurso.getCausaGameOver(); // null = sin game over, string = causa
    }

    /**
     * Retorna un resumen de los recursos actuales.
     */
    getResumen() {
        const r = this.#ciudad.getRecurso();
        return {
            money:       r.getMoney(),
            electricity: r.getElectricity(),
            water:       r.getWater(),
            food:        r.getFood(),
            gameOver:    r.isGameOver(),
        };
    }

    // ── Datos del ultimo turno (para la vista) ────────────────
    /** @returns {{ money, electricity, water, food }} */
    getUltimaProduccion() { return { ...this.#ultimaProduccion }; }

    /** @returns {{ electricidad, agua, food }} */
    getUltimoConsumo()    { return { ...this.#ultimoConsumo }; }

    /** @param {number} totalMantenimiento - total descontado en aplicarMantenimiento del mismo turno */
    setUltimoMantenimientoDinero(totalMantenimiento) {
        this.#ultimoMantenimientoDinero = Math.max(0, Number(totalMantenimiento) || 0);
    }

    getUltimoMantenimientoDinero() {
        return this.#ultimoMantenimientoDinero;
    }

    getBalanceElectricidad() { return this.#ciudad.getRecurso().getElectricity(); }
    getBalanceAgua()         { return this.#ciudad.getRecurso().getWater(); }
}
