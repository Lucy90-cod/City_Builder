/**
 * ControladorPuntuacion.js
 * Delega el calculo a Puntuacion.js y expone resultados a la vista.
 */

export class ControladorPuntuacion {

    #ciudad;

    constructor(ciudad) {
        this.#ciudad = ciudad;
    }

    /**
     * Calcula el score del turno actual.
     * Paso 5 de ejecutarTurno().
     * @returns {number}
     */
    calcular() {
        const puntuacion = this.#ciudad.getPuntuacion();
        if (!puntuacion) return 0;
        return puntuacion.calcular(this.#ciudad);
    }

    getScore() {
        return this.#ciudad.getPuntuacion()?.getScore() ?? 0;
    }

    getHistorico() {
        return this.#ciudad.getPuntuacion()?.getHistorico() ?? [];
    }

    getDesglose() {
        return this.#ciudad.getPuntuacion()?.getDesglose(this.#ciudad) ?? {};
    }
}