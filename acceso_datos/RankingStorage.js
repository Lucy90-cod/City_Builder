/**
 * RankingStorage.js
 * Persiste el ranking en LocalStorage.
 */

import { Ranking } from '../modelos/Ranking.js';

export class RankingStorage {

    static #KEY = 'cbg_ranking';

    static save(ranking) {
        try {
            localStorage.setItem(RankingStorage.#KEY, JSON.stringify(ranking.toJSON()));
        } catch(e) {
            console.error('RankingStorage.save() fallo:', e.message);
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(RankingStorage.#KEY);
            return raw ? JSON.parse(raw) : null;
        } catch(e) {
            console.error('RankingStorage.load() fallo:', e.message);
            return null;
        }
    }

    /**
     * Agrega una ciudad al ranking guardado directamente.
     * @param {Ciudad} ciudad
     */
    static agregar(ciudad) {
        try {
            const data    = RankingStorage.load();
            const ranking = data ? Ranking.fromJSON(data) : new Ranking();
            ranking.agregarEntrada(ciudad);
            RankingStorage.save(ranking);
        } catch(e) {
            console.error('RankingStorage.agregar() fallo:', e.message);
        }
    }

    static delete() {
        localStorage.removeItem(RankingStorage.#KEY);
    }
}