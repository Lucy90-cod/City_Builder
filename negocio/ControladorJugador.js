/**
 * ControladorJugador.js
 * Gestiona la creacion y persistencia del jugador.
 */
import { Jugador }        from '../modelos/Jugador.js';
import { JugadorStorage } from '../acceso_datos/JugadorStorage.js';

export class ControladorJugador {

    #jugador;

    constructor() {
        this.#jugador = null;
    }

    crearJugador(nombre) {
        if (!nombre?.trim()) throw new Error('El nombre del jugador es obligatorio');
        const id      = `j_${Date.now()}`;
        this.#jugador = new Jugador(id, nombre.trim());
        JugadorStorage.save(this.#jugador);
        return this.#jugador;
    }

    getJugador() { return this.#jugador; }

    guardar() {
        if (this.#jugador) JugadorStorage.save(this.#jugador);
    }

    cargar() {
        const data = JugadorStorage.load();
        if (!data) return null;
        this.#jugador = Jugador.fromJSON(data);
        return this.#jugador;
    }
}