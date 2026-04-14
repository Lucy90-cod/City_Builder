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
        const edificios = this.#ciudad.getEdificios();

        // Mapa id → posicion para lookup O(1)
        const posiciones = new Map();
        edificios.forEach(e => posiciones.set(e.getId(), e.getPosicion()));

        // Servicios activos con su radio individual
        const serviciosActivos = edificios.filter(e => e.getTipo() === 'servicio' && e.isActivo());

        // Parques siguen afectando a todos (sin radio)
        const totalParques = edificios.filter(e => e.getTipo() === 'parque' && e.isActivo()).length;

        const sinAlimentos = (this.#ciudad.getRecurso()?.getFood() ?? 1) <= 0;

        this.#ciudad.getCiudadanos().forEach(ciudadano => {
            // Posicion del ciudadano = posicion de su vivienda
            const residencialId = ciudadano.getEdificioResidencialId();
            const posHome       = residencialId ? posiciones.get(residencialId) : null;

            // Contar servicios dentro del radio (distancia Chebyshev)
            let serviciosCercanos = 0;
            if (posHome) {
                for (const servicio of serviciosActivos) {
                    const pos = servicio.getPosicion();
                    const dist = Math.max(
                        Math.abs(pos.x - posHome.x),
                        Math.abs(pos.y - posHome.y)
                    );
                    if (dist <= servicio.getRadio()) {
                        serviciosCercanos++;
                    }
                }
            }

            ciudadano.calcularFelicidad({
                serviciosCercanos,
                parquesCercanos:          totalParques,
                beneficioServicio:        10,
                beneficioParque:          5,
                penalizacionSinAlimentos: sinAlimentos ? 15 : 0,
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

}