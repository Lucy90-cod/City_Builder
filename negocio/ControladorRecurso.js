/**
 
 * Calcula produccion y consumo de todos los edificios cada turno.
 * Usa polimorfismo — llama calcularProduccion() y calcularConsumo()
 * sin saber el tipo de edificio.
 */

export class ControladorRecurso {

    #ciudad;

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

        const totalProduccion = { money: 0, electricity: 0, water: 0, food: 0 };

        edificios.forEach(e => {
            if (!e.isActivo()) return;
            const prod = e.calcularProduccion();
            totalProduccion.money       += prod.money       ?? 0;
            totalProduccion.electricity += prod.electricity ?? 0;
            totalProduccion.water       += prod.water       ?? 0;
            totalProduccion.food        += prod.food        ?? 0;
        });

        recurso.updateBalance(totalProduccion, {});
    }

    /**
     * Suma el consumo de todos los edificios activos
     * y lo descuenta del recurso.
     * Paso 2 de ejecutarTurno().
     * @returns {boolean} true si es game over
     */
    calcularConsumo() {
        const recurso   = this.#ciudad.getRecurso();
        const edificios = this.#ciudad.getEdificios();

        const totalConsumo = { electricidad: 0, agua: 0 };

        edificios.forEach(e => {
            if (!e.isActivo()) return;
            const consumo = e.calcularConsumo();
            totalConsumo.electricidad += consumo.electricidad ?? 0;
            totalConsumo.agua         += consumo.agua         ?? 0;
        });

        recurso.updateBalance({}, totalConsumo);
        return recurso.isGameOver();
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

    getBalanceElectricidad() { return this.#ciudad.getRecurso().getElectricity(); }
    getBalanceAgua()         { return this.#ciudad.getRecurso().getWater(); }
}