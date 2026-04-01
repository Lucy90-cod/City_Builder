/**
 * validadores.js
 * Funciones puras de validacion reutilizables en toda la aplicacion.
 * No dependen de ninguna clase del dominio — reciben solo datos primitivos.
 */

import { MAPA, CIUDADANOS } from './constantes.js';

// ── Mapa ─────────────────────────────────────────────────────────────────────

/**
 * Verifica que las dimensiones del mapa esten dentro del rango permitido.
 * @param {number} ancho
 * @param {number} alto
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function validarDimensionesMapa(ancho, alto) {
    if (ancho < MAPA.MIN_ANCHO || ancho > MAPA.MAX_ANCHO) {
        return {
            ok: false,
            mensaje: `El ancho debe estar entre ${MAPA.MIN_ANCHO} y ${MAPA.MAX_ANCHO}. Recibido: ${ancho}`,
        };
    }
    if (alto < MAPA.MIN_ALTO || alto > MAPA.MAX_ALTO) {
        return {
            ok: false,
            mensaje: `El alto debe estar entre ${MAPA.MIN_ALTO} y ${MAPA.MAX_ALTO}. Recibido: ${alto}`,
        };
    }
    return { ok: true, mensaje: 'Dimensiones validas' };
}

/**
 * Verifica que las coordenadas (x, y) esten dentro del mapa.
 * @param {number} x
 * @param {number} y
 * @param {number} ancho - ancho del mapa
 * @param {number} alto  - alto del mapa
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function validarCoordenadas(x, y, ancho, alto) {
    if (x < 0 || x >= ancho || y < 0 || y >= alto) {
        return {
            ok: false,
            mensaje: `Coordenadas (${x},${y}) fuera del mapa (${ancho}x${alto})`,
        };
    }
    return { ok: true, mensaje: 'Coordenadas validas' };
}

// ── Construccion ─────────────────────────────────────────────────────────────

/**
 * Verifica si hay fondos suficientes para una operacion.
 * @param {number} dineroActual
 * @param {number} costo
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function validarPresupuesto(dineroActual, costo) {
    if (dineroActual < costo) {
        return {
            ok: false,
            mensaje: `Fondos insuficientes. Necesitas $${costo}, tienes $${dineroActual}`,
        };
    }
    return { ok: true, mensaje: 'Fondos suficientes' };
}

/**
 * Verifica si una celda esta disponible (no ocupada).
 * @param {boolean} estaOcupada
 * @param {number} x
 * @param {number} y
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function validarCeldaLibre(estaOcupada, x, y) {
    if (estaOcupada) {
        return { ok: false, mensaje: `La celda (${x},${y}) ya esta ocupada` };
    }
    return { ok: true, mensaje: 'Celda disponible' };
}

/**
 * Verifica que haya al menos una via adyacente al edificio.
 * @param {boolean} tieneVia - resultado de mapa.tieneViaAdyacente(x, y)
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function validarAdyacenciaVia(tieneVia) {
    if (!tieneVia) {
        return {
            ok: false,
            mensaje: 'El edificio debe estar adyacente a al menos una via',
        };
    }
    return { ok: true, mensaje: 'Via adyacente encontrada' };
}

/**
 * Ejecuta todas las validaciones de construccion en orden.
 * Devuelve el primer error encontrado, o ok si pasan todas.
 * @param {{ estaOcupada: boolean, tieneVia: boolean, dinero: number, costo: number, x: number, y: number }} params
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function validarConstruccion({ estaOcupada, tieneVia, dinero, costo, x, y }) {
    const checks = [
        validarCeldaLibre(estaOcupada, x, y),
        validarAdyacenciaVia(tieneVia),
        validarPresupuesto(dinero, costo),
    ];

    for (const check of checks) {
        if (!check.ok) return check;
    }

    return { ok: true, mensaje: 'Construccion valida' };
}

// ── Ciudadanos ───────────────────────────────────────────────────────────────

/**
 * Verifica que la tasa de crecimiento este en el rango permitido.
 * @param {number} tasa
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function validarTasaCrecimiento(tasa) {
    if (tasa < CIUDADANOS.TASA_CRECIMIENTO_MIN || tasa > CIUDADANOS.TASA_CRECIMIENTO_MAX) {
        return {
            ok: false,
            mensaje: `La tasa debe estar entre ${CIUDADANOS.TASA_CRECIMIENTO_MIN} y ${CIUDADANOS.TASA_CRECIMIENTO_MAX}. Recibido: ${tasa}`,
        };
    }
    return { ok: true, mensaje: 'Tasa valida' };
}

// ── Turno ────────────────────────────────────────────────────────────────────

/**
 * Verifica que la duracion del turno sea valida (minimo 5 segundos).
 * @param {number} segundos
 * @param {number} [minimo=5]
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function validarDuracionTurno(segundos, minimo = 5) {
    if (typeof segundos !== 'number' || isNaN(segundos) || segundos < minimo) {
        return {
            ok: false,
            mensaje: `La duracion del turno debe ser al menos ${minimo} segundos. Recibido: ${segundos}`,
        };
    }
    return { ok: true, mensaje: 'Duracion valida' };
}

// ── General ──────────────────────────────────────────────────────────────────

/**
 * Verifica que un valor numerico configurable sea positivo.
 * Util para validar consumos, beneficios y otros parametros de la UI.
 * @param {number} valor
 * @param {string} nombreCampo
 * @returns {{ ok: boolean, mensaje: string }}
 */
export function validarNumeroPositivo(valor, nombreCampo = 'El valor') {
    if (typeof valor !== 'number' || isNaN(valor) || valor < 0) {
        return {
            ok: false,
            mensaje: `${nombreCampo} debe ser un numero positivo. Recibido: ${valor}`,
        };
    }
    return { ok: true, mensaje: `${nombreCampo} valido` };
}
