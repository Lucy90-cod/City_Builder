/**
 * * arreglo de edificios en LocalStorage.
 * Guarda como JSON, carga como array de objetos planos.
 *
 * NOTA: La reconstruccion de instancias (fromJSON) la hace
 * ControladorEdificio, no este storage. Aqui solo entra y sale JSON.
 */

export class EdificioStorage {

    static #KEY = 'cbg_edificios';

    /**
     * Guarda el array de edificios en LocalStorage.
     * @param {Edificio[]} edificios
     */
    static save(edificios) {
        try {
            const data = edificios.map(e => e.toJSON());
            localStorage.setItem(EdificioStorage.#KEY, JSON.stringify(data));
        } catch (e) {
            console.error('EdificioStorage.save() fallo:', e.message);
        }
    }

    /**
     * Carga los edificios desde LocalStorage.
     * @returns {Object[]|null} Array de objetos planos, o null si no hay datos
     */
    static load() {
        try {
            const raw = localStorage.getItem(EdificioStorage.#KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            console.error('EdificioStorage.load() fallo:', e.message);
            return null;
        }
    }

    /**
     * Elimina los edificios guardados.
     */
    static delete() {
        localStorage.removeItem(EdificioStorage.#KEY);
    }

    /**
     * Verifica si hay edificios guardados.
     * @returns {boolean}
     */
    static existe() {
        return localStorage.getItem(EdificioStorage.#KEY) !== null;
    }
}