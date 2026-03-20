/**
 * JugadorStorage.js
 * Persiste el jugador en LocalStorage.
 */

export class JugadorStorage {

    static #KEY = 'cbg_jugador';

    static save(jugador) {
        try {
            localStorage.setItem(JugadorStorage.#KEY, JSON.stringify(jugador.toJSON()));
        } catch(e) {
            console.error('JugadorStorage.save() fallo:', e.message);
        }
    }

    static load() {
        try {
            const raw = localStorage.getItem(JugadorStorage.#KEY);
            return raw ? JSON.parse(raw) : null;
        } catch(e) {
            console.error('JugadorStorage.load() fallo:', e.message);
            return null;
        }
    }

    static delete() {
        localStorage.removeItem(JugadorStorage.#KEY);
    }
}