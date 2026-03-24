/**
 * Puntuacion.js
 * Calcula y guarda el score de la ciudad cada turno.
 *
 * Formula:
 *   score = (poblacion*10) + (felicidad_avg*5) + (dinero/100)
 *         + (num_edificios*50) + (bal_elec*2) + (bal_agua*2)
 *         + bonificaciones - penalizaciones
 *
 * Bonificaciones:
 *   +500  todos los ciudadanos tienen empleo
 *   +300  felicidad promedio > 80
 *   +200  electricidad y agua positivas
 *   +1000 poblacion > 1000
 *
 * Penalizaciones:
 *   -500  dinero negativo
 *   -300  electricidad negativa
 *   -300  agua negativa
 *   -400  felicidad promedio < 40
 *   -10   por cada ciudadano sin empleo
 */

export class Puntuacion {

    #scoreActual;
    #historico;     // Array de numeros
    #turno;

    constructor() {
        this.#scoreActual = 0;
        this.#historico   = [];
        this.#turno       = 0;
    }

    // ── Getters ─────────────────────────────────────────────
    getScore()    { return this.#scoreActual; }
    getHistorico(){ return [...this.#historico]; }
    getTurno()    { return this.#turno; }

    // ── Calculo ──────────────────────────────────────────────

    /**
     * Calcula el score actual basado en el estado de la ciudad.
     * @param {Ciudad} ciudad
     * @returns {number} score calculado
     */
    calcular(ciudad) {
        const recurso    = ciudad.getRecurso();
        const ciudadanos = ciudad.getCiudadanos();
        const edificios  = ciudad.getEdificios();

        const poblacion    = ciudadanos.length;
        const numEdificios = edificios.length;
        const dinero       = recurso?.getMoney()       ?? 0;
        const electricidad = recurso?.getElectricity() ?? 0;
        const agua         = recurso?.getWater()       ?? 0;

        // Felicidad promedio
        const felicidadAvg = poblacion > 0
            ? ciudadanos.reduce((sum, c) => sum + c.getFelicidad(), 0) / poblacion
            : 50;

        // Desempleados
        const desempleados = ciudadanos.filter(c => !c.tieneEmpleo()).length;

        // ── Formula base ─────────────────────────────────────
        let score = 0;
        score += poblacion    * 10;
        score += felicidadAvg * 5;
        score += dinero       / 100;
        score += numEdificios * 50;
        score += electricidad * 2;
        score += agua         * 2;

        // ── Bonificaciones ───────────────────────────────────
        if (desempleados === 0 && poblacion > 0) score += 500;
        if (felicidadAvg > 80)                   score += 300;
        if (electricidad > 0 && agua > 0)        score += 200;
        if (poblacion > 1000)                    score += 1000;

        // ── Penalizaciones ───────────────────────────────────
        if (dinero       < 0)  score -= 500;
        if (electricidad < 0)  score -= 300;
        if (agua         < 0)  score -= 300;
        if (felicidadAvg < 40) score -= 400;
        score -= desempleados * 10;

        this.#scoreActual = Math.round(Math.max(0, score));
        this.#turno       = ciudad.getTurnoActual();
        this.#historico.push(this.#scoreActual);

        return this.#scoreActual;
    }

    /**
     * Retorna el desglose del ultimo calculo para mostrar en UI.
     * @param {Ciudad} ciudad
     */
    getDesglose(ciudad) {
        if (!ciudad) return {};

        const recurso    = ciudad.getRecurso();
        const ciudadanos = ciudad.getCiudadanos();
        const edificios  = ciudad.getEdificios();

        const poblacion    = ciudadanos.length;
        const numEdificios = edificios.length;
        const dinero       = recurso?.getMoney()       ?? 0;
        const electricidad = recurso?.getElectricity() ?? 0;
        const agua         = recurso?.getWater()       ?? 0;

        const felicidadAvg = poblacion > 0
            ? ciudadanos.reduce((sum, c) => sum + c.getFelicidad(), 0) / poblacion
            : 50;

        const desempleados = ciudadanos.filter(c => !c.tieneEmpleo()).length;

        // ── Contribuciones base ───────────────────────────────
        const puntosPoblacion    = poblacion    * 10;
        const puntosFelicidad    = Math.round(felicidadAvg * 5);
        const puntosEdificios    = numEdificios * 50;
        const puntosDinero       = Math.floor(dinero / 100);
        const puntosElectricidad = electricidad * 2;
        const puntosAgua         = agua         * 2;

        // ── Bonificaciones ────────────────────────────────────
        const bonificaciones = [];
        if (desempleados === 0 && poblacion > 0) bonificaciones.push({ nombre: 'Todos empleados',      valor: 500  });
        if (felicidadAvg > 80)                   bonificaciones.push({ nombre: 'Felicidad > 80',       valor: 300  });
        if (electricidad > 0 && agua > 0)        bonificaciones.push({ nombre: 'Recursos positivos',   valor: 200  });
        if (poblacion > 1000)                    bonificaciones.push({ nombre: 'Ciudad > 1000 hab.',   valor: 1000 });

        // ── Penalizaciones ────────────────────────────────────
        const penalizaciones = [];
        if (dinero       < 0)  penalizaciones.push({ nombre: 'Dinero negativo',        valor: -500 });
        if (electricidad < 0)  penalizaciones.push({ nombre: 'Electricidad negativa',  valor: -300 });
        if (agua         < 0)  penalizaciones.push({ nombre: 'Agua negativa',          valor: -300 });
        if (felicidadAvg < 40) penalizaciones.push({ nombre: 'Baja felicidad',         valor: -400 });
        if (desempleados > 0)  penalizaciones.push({ nombre: `Desempleo (${desempleados})`, valor: -(desempleados * 10) });

        return {
            poblacion,
            felicidadAvg:     Math.round(felicidadAvg),
            dinero,
            electricidad,
            agua,
            numEdificios,
            puntosPoblacion,
            puntosFelicidad,
            puntosEdificios,
            puntosDinero,
            puntosElectricidad,
            puntosAgua,
            bonificaciones,
            penalizaciones,
            total: this.#scoreActual,
        };
    }

    // ── Serialización ────────────────────────────────────────
    toJSON() {
        return {
            scoreActual: this.#scoreActual,
            historico:   this.#historico,
            turno:       this.#turno,
        };
    }

    static fromJSON(data) {
        const p = new Puntuacion();
        p.#scoreActual = data.scoreActual ?? 0;
        p.#historico   = data.historico   ?? [];
        p.#turno       = data.turno       ?? 0;
        return p;
    }
}