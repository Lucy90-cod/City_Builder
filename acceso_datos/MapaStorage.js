/**
 * MapaStorage.js
 * Persiste el estado del mapa en LocalStorage.
 */

export class MapaStorage {

    static #KEY = 'cbg_mapa';

    /**
     * Guarda el mapa en LocalStorage.
     * @param {Mapa} mapa
     */
    static save(mapa) {
        try {
            localStorage.setItem(MapaStorage.#KEY, JSON.stringify(mapa.toJSON()));
        } catch (e) {
            console.error('MapaStorage.save() fallo:', e.message);
        }
    }

    /**
     * Carga el mapa desde LocalStorage.
     * @returns {Object|null} Objeto plano para reconstruir con Mapa.fromJSON(), o null
     */
    static load() {
        try {
            const raw = localStorage.getItem(MapaStorage.#KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.error('MapaStorage.load() fallo:', e.message);
            return null;
        }
    }

    /**
     * Elimina el mapa guardado.
     */
    static delete() {
        localStorage.removeItem(MapaStorage.#KEY);
    }

    /**
     * Verifica si hay un mapa guardado.
     * @returns {boolean}
     */
    static existe() {
        return localStorage.getItem(MapaStorage.#KEY) !== null;
    }
}