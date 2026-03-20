/**
 * CiudadanoStorage.js
 * Persiste el array de ciudadanos en LocalStorage.
 */

export class CiudadanoStorage {

    static #KEY = 'cbg_ciudadanos';

    static save(ciudadanos) {
        try {
            const data = ciudadanos.map(c => c.toJSON());
            localStorage.setItem(CiudadanoStorage.#KEY, JSON.stringify(data));
        } catch(e) {
            console.error('CiudadanoStorage.save() fallo:', e.message);
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(CiudadanoStorage.#KEY);
            return raw ? JSON.parse(raw) : null;
        } catch(e) {
            console.error('CiudadanoStorage.load() fallo:', e.message);
            return null;
        }
    }

    static delete() {
        localStorage.removeItem(CiudadanoStorage.#KEY);
    }
}