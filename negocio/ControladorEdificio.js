/**
 *  Logica de construccion y demolicion de edificios.
 * Valida: celda vacia + fondos suficientes + via adyacente.
 * Al demoler devuelve el 50% del costo al jugador.
 */

import { Residencial } from '../modelos/Residencial.js';
import { Comercial }   from '../modelos/Comercial.js';
import { Industrial }  from '../modelos/Industrial.js';
import { Servicio }    from '../modelos/Servicio.js';
import { Planta }      from '../modelos/Planta.js';
import { Parque }      from '../modelos/Parque.js';

export class ControladorEdificio {

    #ciudad;

    constructor(ciudad) {
        this.#ciudad = ciudad;
    }

    // ── Construccion ─────────────────────────────────────────

    /**
     * Intenta construir un edificio en la posicion (x, y).
     * @param {string} tipo    - 'residencial'|'comercial'|'industrial'|'servicio'|'planta'|'parque'
     * @param {string} subtipo - subtipo segun la clase
     * @param {number} x
     * @param {number} y
     * @returns {{ ok: boolean, mensaje: string }}
     */
    construir(tipo, subtipo, x, y) {
        // 1. Crear instancia temporal para conocer el costo
        let edificio;
        try {
            edificio = this.#crearInstancia(tipo, subtipo, `tmp`, { x, y });
        } catch (e) {
            return { ok: false, mensaje: `Tipo invalido: ${e.message}` };
        }

        // 2. Validar condiciones
        const validacion = this.validarConstruccion(x, y, edificio.getCosto());
        if (!validacion.ok) return validacion;

        // 3. Generar id unico
        const id = `${tipo[0]}${subtipo ? subtipo[0] : 'p'}_${Date.now()}`;
        edificio = this.#crearInstancia(tipo, subtipo, id, { x, y });

        // 4. Descontar costo
        this.#ciudad.getRecurso().addMoney(-edificio.getCosto());

        // 5. Marcar celda en el mapa
        const celda = this.#ciudad.getMapa().getCelda(x, y);
        celda.setTipo('building');
        celda.setEdificioId(id);

        // 6. Agregar a la ciudad
        this.#ciudad.agregarEdificio(edificio);

        return { ok: true, mensaje: `${tipo} construido en (${x},${y})` };
    }

    /**
     * Crea la instancia correcta segun tipo y subtipo.
     */
    #crearInstancia(tipo, subtipo, id, posicion) {
        switch (tipo) {
            case 'residencial': return new Residencial(id, subtipo, posicion);
            case 'comercial':   return new Comercial(id, subtipo, posicion);
            case 'industrial':  return new Industrial(id, subtipo, posicion);
            case 'servicio':    return new Servicio(id, subtipo, posicion);
            case 'planta':      return new Planta(id, subtipo, posicion);
            case 'parque':      return new Parque(id, posicion);
            default: throw new Error(`Tipo de edificio desconocido: "${tipo}"`);
        }
    }

    // ── Validacion ───────────────────────────────────────────

    /**
     * Verifica si se puede construir en (x, y) con el costo dado.
     * @returns {{ ok: boolean, mensaje: string }}
     */
    validarConstruccion(x, y, costo) {
        const mapa    = this.#ciudad.getMapa();
        const recurso = this.#ciudad.getRecurso();

        if (mapa.estaOcupada(x, y))
            return { ok: false, mensaje: 'La celda ya esta ocupada' };

        if (!mapa.tieneViaAdyacente(x, y))
            return { ok: false, mensaje: 'El edificio necesita una via adyacente' };

        if (recurso.getMoney() < costo)
            return { ok: false, mensaje: `Fondos insuficientes. Necesitas $${costo}, tienes $${recurso.getMoney()}` };

        return { ok: true, mensaje: 'Construccion valida' };
    }

    // ── Demolicion ───────────────────────────────────────────

    /**
     * Demoler un edificio por su id. Devuelve el 50% del costo.
     * @param {string} id
     * @returns {{ ok: boolean, mensaje: string }}
     */
    demoler(id) {
        const edificio = this.#ciudad.getEdificios().find(e => e.getId() === id);
        if (!edificio) return { ok: false, mensaje: `Edificio "${id}" no encontrado` };

        // Devolver 50% del costo
        const reembolso = Math.floor(edificio.getCosto() * 0.5);
        this.#ciudad.getRecurso().addMoney(reembolso);

        // Limpiar celda en el mapa
        const pos = edificio.getPosicion();
        const celda = this.#ciudad.getMapa().getCelda(pos.x, pos.y);
        celda.setTipo('grass');
        celda.setEdificioId(null);

        // Quitar de la ciudad
        this.#ciudad.demolerEdificio(id);

        return { ok: true, mensaje: `Edificio demolido. Reembolso: $${reembolso}` };
    }

    // ── Mantenimiento ────────────────────────────────────────

    /**
     * Descuenta el costo de mantenimiento de cada edificio activo.
     * Llamado en cada turno por ControladorTurno (paso 3).
     */
    aplicarMantenimiento() {
        const recurso = this.#ciudad.getRecurso();
        this.#ciudad.getEdificios().forEach(e => {
            if (e.isActivo()) {
                recurso.addMoney(-e.getCostoMantenimiento());
            }
        });
    }

    // ── Consultas ────────────────────────────────────────────

    getEdificiosPorTipo(tipo) {
        return this.#ciudad.getEdificios().filter(e => e.getTipo() === tipo);
    }

    getTotalEdificios() {
        return this.#ciudad.getEdificios().length;
    }

    crearInstanciaPublica(tipo, subtipo, id, posicion) {
    try {
        return this.#crearInstancia(tipo, subtipo, id, posicion);
    } catch (e) {
        console.warn(`No se pudo crear ${tipo}:`, e.message);
        return null;
    }
}
}