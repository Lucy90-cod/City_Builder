/**
 * ControladorTurno.js
 * Corazon del juego — ejecuta los 6 pasos cada X segundos.
 * La duracion es configurable desde un input en la vista.
 *
 * 6 pasos de ejecutarTurno() en orden:
 *   1. calcularProduccion()
 *   2. calcularConsumo()    → si gameOver → terminarJuego()
 *   3. aplicarMantenimiento()
 *   4. actualizarFelicidad()
 *   5. calcularPuntuacion()
 *   6. guardar en LocalStorage
 */

import { ControladorRecurso }    from './ControladorRecurso.js';
import { ControladorEdificio }   from './ControladorEdificio.js';
import { ControladorCiudadano }  from './ControladorCiudadano.js';
import { ControladorPuntuacion } from './ControladorPuntuacion.js';
import { CiudadStorage }         from '../acceso_datos/CiudadStorage.js';

export class ControladorTurno {

    #ciudad;
    #duracionTurno;     // segundos
    #intervalo;         // referencia al setInterval
    #enEjecucion;

    // Sub-controladores
    #ctrlRecurso;
    #ctrlEdificio;
    #ctrlCiudadano;
    #ctrlPuntuacion;

    // Callback para notificar a la vista despues de cada turno
    #onTurnoCompletado;
    #onGameOver;

    /**
     * @param {Ciudad}   ciudad
     * @param {Function} onTurnoCompletado - callback(ciudad) llamado al terminar cada turno
     * @param {Function} onGameOver        - callback(ciudad) llamado cuando game over
     * @param {number}   duracionSegundos  - duracion del turno en segundos (default 30)
     */
    constructor(ciudad, onTurnoCompletado, onGameOver, duracionSegundos = 30) {
        this.#ciudad           = ciudad;
        this.#duracionTurno    = duracionSegundos;
        this.#intervalo        = null;
        this.#enEjecucion      = false;
        this.#onTurnoCompletado = onTurnoCompletado ?? (() => {});
        this.#onGameOver        = onGameOver        ?? (() => {});

        this.#ctrlRecurso   = new ControladorRecurso(ciudad);
        this.#ctrlEdificio  = new ControladorEdificio(ciudad);
        this.#ctrlCiudadano = new ControladorCiudadano(ciudad);
        this.#ctrlPuntuacion= new ControladorPuntuacion(ciudad);
    }

    // ── Control del turno ────────────────────────────────────

    iniciar() {
        if (this.#enEjecucion) return;
        this.#enEjecucion = true;
        this.#intervalo = setInterval(
            () => this.#ejecutarTurno(),
            this.#duracionTurno * 1000
        );
    }

    pausar() {
        if (!this.#enEjecucion) return;
        clearInterval(this.#intervalo);
        this.#intervalo   = null;
        this.#enEjecucion = false;
    }

    reanudar() {
        this.iniciar();
    }

    /**
     * Cambia la duracion del turno desde el input de la vista.
     * @param {number} segundos
     */
    setDuracion(segundos) {
        const seg = Math.max(5, Number(segundos)); // minimo 5 segundos
        this.#duracionTurno = seg;
        if (this.#enEjecucion) {
            this.pausar();
            this.iniciar();
        }
    }

    isEnEjecucion() { return this.#enEjecucion; }
    getDuracion()   { return this.#duracionTurno; }

    // ── Los 6 pasos ──────────────────────────────────────────

    #ejecutarTurno() {
        // Paso 1 — Produccion
        this.#ctrlRecurso.calcularProduccion();

        // Paso 2 — Consumo → verificar game over
        const causaGameOver = this.#ctrlRecurso.calcularConsumo();
        if (causaGameOver) {
            this.#terminarJuego(causaGameOver);
            return;
        }

        // Paso 3 — Mantenimiento
        this.#ctrlEdificio.aplicarMantenimiento();

        // Paso 4 — Felicidad + crecimiento
        this.#ctrlCiudadano.actualizarFelicidad();
        this.#ctrlCiudadano.crearCiudadanos();
        
        // Reasignacion de viviendas, empleos
        this.#ctrlCiudadano.asignarViviendas();
        this.#ctrlCiudadano.asignarEmpleos();

        // Paso 5 — Puntuacion
        this.#ctrlPuntuacion.calcular();

        // Paso 6 — Guardar
        this.#ciudad.avanzarTurno();
        CiudadStorage.save(this.#ciudad);

        // Notificar a la vista
        this.#onTurnoCompletado(this.#ciudad);
    }

    #terminarJuego(causa) {
        this.pausar();
        CiudadStorage.save(this.#ciudad);
        this.#onGameOver(this.#ciudad, causa);
    }
}