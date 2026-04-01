/**
 * ControladorRanking.js
 * Gestiona el ranking de ciudades.
 */

import { Ranking }        from '../modelos/Ranking.js';
import { RankingStorage } from '../acceso_datos/RankingStorage.js';

export class ControladorRanking {

    #ranking;

    constructor() {
        this.#ranking = null;
        this.#cargarOCrear();
    }

    #cargarOCrear() {
        const data    = RankingStorage.load();
        this.#ranking = data ? Ranking.fromJSON(data) : new Ranking();
    }

    /**
     * Registra la ciudad actual en el ranking y guarda.
     * @param {Ciudad} ciudad
     */
    registrarCiudad(ciudad) {
        this.#ranking.agregarEntrada(ciudad);
        RankingStorage.save(this.#ranking);
    }

    registrarGameOver(ciudad) {
        this.#ranking.agregarEntrada(ciudad, true);
        RankingStorage.save(this.#ranking);
    }

    getTop10()              { return this.#ranking.getTop10(); }
    getTodasEntradas()      { return this.#ranking.getTodasEntradas(); }
    getPosicion(ciudadId)   { return this.#ranking.getPosicion(ciudadId); }
    getEntrada(ciudadId)    { return this.#ranking.getEntrada(ciudadId); }

    limpiar() {
        this.#ranking.limpiar();
        RankingStorage.delete();
    }

    /**
     * Exporta el ranking como JSON descargable.
     */
    exportar() {
        const json = JSON.stringify(this.#ranking.toJSON(), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'ranking_springfield.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}