/**
 * CiudadStorage.js
 * Persiste la ciudad completa en LocalStorage.
 */

export class CiudadStorage {

    static #KEY = 'cbg_ciudad';

    static save(ciudad) {
        try {
            localStorage.setItem(CiudadStorage.#KEY, JSON.stringify(ciudad.toJSON()));
        } catch(e) {
            console.error('CiudadStorage.save() fallo:', e.message);
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(CiudadStorage.#KEY);
            return raw ? JSON.parse(raw) : null;
        } catch(e) {
            console.error('CiudadStorage.load() fallo:', e.message);
            return null;
        }
    }

    static delete() {
        localStorage.removeItem(CiudadStorage.#KEY);
    }

    static hayPartida() {
        return localStorage.getItem(CiudadStorage.#KEY) !== null;
    }
}