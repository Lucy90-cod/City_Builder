/**
 * ControladorCiudadano.js
 * Gestiona la poblacion: crea ciudadanos automaticamente,
 * los asigna a viviendas y empleos, y actualiza su felicidad.
 *
 * Condiciones para crecer:
 *   - Hay viviendas disponibles
 *   - Felicidad promedio > 60
 *   - Hay empleos disponibles
 *   Tasa: 1-3 ciudadanos por turno (configurable)
 */

import { Ciudadano } from '../modelos/Ciudadano.js';

export class ControladorCiudadano {

    #ciudad;
    #tasaCrecimiento;   // 1-3, configurable
    #contadorId;        // para generar ids unicos

    constructor(ciudad, tasaCrecimiento = 2) {
        this.#ciudad          = ciudad;
        this.#tasaCrecimiento = tasaCrecimiento;
        this.#contadorId      = 0;
    }

    // ── Getter / Setter ──────────────────────────────────────
    getTasaCrecimiento() { return this.#tasaCrecimiento; }

    setTasaCrecimiento(tasa) {
        if (tasa < 1 || tasa > 3) throw new Error('La tasa debe estar entre 1 y 3');
        this.#tasaCrecimiento = tasa;
    }

    // ── Crear ciudadanos ─────────────────────────────────────

    /**
     * Crea nuevos ciudadanos si se cumplen las condiciones.
     * Llamado en cada turno por ControladorTurno.
     */
    crearCiudadanos() {
        if (!this.#condicionesParaCrecer()) return;

        for (let i = 0; i < this.#tasaCrecimiento; i++) {
            // Verificar que siga habiendo espacio antes de crear
            if (!this.#hayViviendasDisponibles()) break;
            if (!this.#hayEmpleosDisponibles())   break;

            const id        = `c_${Date.now()}_${++this.#contadorId}`;
            const ciudadano = new Ciudadano(id);
            this.#ciudad.agregarCiudadano(ciudadano);
        }

        // Asignar viviendas y empleos a los nuevos
        this.asignarViviendas();
        this.asignarEmpleos();
    }

    // ── Asignaciones ─────────────────────────────────────────

    /**
     * Asigna ciudadanos sin vivienda a edificios residenciales
     * que tengan capacidad disponible.
     */
    asignarViviendas() {
        const sinVivienda = this.#ciudad.getCiudadanos()
            .filter(c => !c.tieneVivienda());

        if (sinVivienda.length === 0) return;

        const residenciales = this.#ciudad.getEdificios()
            .filter(e => e.getTipo() === 'residencial' && e.isActivo());

        for (const ciudadano of sinVivienda) {
            const edificio = residenciales.find(e => e.getDisponible() > 0);
            if (!edificio) break;
            edificio.agregarOcupante(ciudadano);
            ciudadano.asignarVivienda(edificio.getId());
        }
    }

    /**
     * Asigna ciudadanos sin empleo a edificios comerciales
     * e industriales que tengan vacantes.
     */
    asignarEmpleos() {
        const sinEmpleo = this.#ciudad.getCiudadanos()
            .filter(c => !c.tieneEmpleo());

        if (sinEmpleo.length === 0) return;

        const conEmpleos = this.#ciudad.getEdificios()
            .filter(e =>
                (e.getTipo() === 'comercial' || e.getTipo() === 'industrial')
                && e.isActivo()
                && e.getEmpleosDisponibles() > 0
            );

        for (const ciudadano of sinEmpleo) {
            const edificio = conEmpleos.find(e => e.getEmpleosDisponibles() > 0);
            if (!edificio) break;
            edificio.asignarEmpleado(ciudadano);
            ciudadano.asignarEmpleo(edificio.getId());
        }
    }

    // ── Felicidad ─────────────────────────────────────────────

    /**
     * Recalcula la felicidad de cada ciudadano segun su contexto.
     * Llamado en cada turno por ControladorTurno (paso 4).
     */
    actualizarFelicidad() {
        const edificios  = this.#ciudad.getEdificios();
        const servicios  = edificios.filter(e => e.getTipo() === 'servicio' && e.isActivo());
        const parques    = edificios.filter(e => e.getTipo() === 'parque'   && e.isActivo());

        this.#ciudad.getCiudadanos().forEach(ciudadano => {
            const pos = ciudadano.getEdificioResidencialId()
                ? this.#ciudad.getEdificioPorId(ciudadano.getEdificioResidencialId())?.getPosicion()
                : null;

            // Contar servicios y parques en radio
            const serviciosCercanos = pos
                ? servicios.filter(s => this.#enRadio(pos, s.getPosicion(), s.getRadio())).length
                : 0;

            const parquesCercanos = pos
                ? parques.filter(p => this.#enRadio(pos, p.getPosicion(), 5)).length
                : 0;

            ciudadano.calcularFelicidad({
                serviciosCercanos,
                parquesCercanos,
                beneficioServicio: 10,
                beneficioParque:   5,
            });
        });
    }

    // ── Consultas ─────────────────────────────────────────────

    getFelicidadPromedio() {
        const ciudadanos = this.#ciudad.getCiudadanos();
        if (ciudadanos.length === 0) return 100;
        const suma = ciudadanos.reduce((s, c) => s + c.getFelicidad(), 0);
        return Math.round(suma / ciudadanos.length);
    }

    getTotalDesempleados() {
        return this.#ciudad.getCiudadanos().filter(c => !c.tieneEmpleo()).length;
    }

    getTotalSinVivienda() {
        return this.#ciudad.getCiudadanos().filter(c => !c.tieneVivienda()).length;
    }

    // ── Privados ──────────────────────────────────────────────

    #condicionesParaCrecer() {
        return this.#hayViviendasDisponibles()
            && this.#hayEmpleosDisponibles()
            && this.getFelicidadPromedio() > 60;
    }

    #hayViviendasDisponibles() {
        return this.#ciudad.getEdificios()
            .some(e => e.getTipo() === 'residencial'
                    && e.isActivo()
                    && e.getDisponible() > 0);
    }

    #hayEmpleosDisponibles() {
        return this.#ciudad.getEdificios()
            .some(e => (e.getTipo() === 'comercial' || e.getTipo() === 'industrial')
                    && e.isActivo()
                    && e.getEmpleosDisponibles() > 0);
    }

    /** Verifica si posA esta dentro del radio de posB */
    #enRadio(posA, posB, radio) {
        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        return Math.sqrt(dx*dx + dy*dy) <= radio;
    }
}