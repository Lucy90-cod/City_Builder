/**
 * ranking.js
 * Carga el ranking, renderiza la tabla top-10
 * y resalta la fila de la ciudad actual del jugador.
 */

import { ControladorRanking } from '../../negocio/ControladorRanking.js';
import { CiudadStorage }      from '../../acceso_datos/CiudadStorage.js';

// ── Inicializacion ───────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const ctrlRanking = new ControladorRanking();
    const top10       = ctrlRanking.getTop10();
    const todas       = ctrlRanking.getTodasEntradas();

    // Obtener ciudad actual para resaltarla
    const dataCiudad   = CiudadStorage.load();
    const ciudadActual = dataCiudad
        ? `${dataCiudad.nombre}_${dataCiudad.nombreAlcalde ?? dataCiudad.alcalde}`
        : null;

    renderizarTabla(top10, ciudadActual);
    mostrarMiCiudad(top10, todas, ciudadActual, ctrlRanking);
    registrarEventos(ctrlRanking);
});

// ── Render tabla ─────────────────────────────────────────────

function renderizarTabla(top10, ciudadActualId) {
    const tbody = document.getElementById('ranking-tbody');
    if (!tbody) return;

    if (top10.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="tabla-vacia">
                    No hay ciudades en el ranking todavia
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = top10.map((entrada, idx) => {
        const pos       = idx + 1;
        const medalla   = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : pos;
        const clasePos  = pos === 1 ? 'medalla-1' : pos === 2 ? 'medalla-2' : pos === 3 ? 'medalla-3' : '';
        const esActual  = entrada.ciudadId === ciudadActualId;

        return `
            <tr class="${esActual ? 'fila-actual' : ''}">
                <td class="${clasePos}">${medalla}</td>
                <td>${entrada.nombre}</td>
                <td>${entrada.alcalde}</td>
                <td class="score-valor">${entrada.score.toLocaleString('es-CO')}</td>
                <td>${entrada.poblacion ?? 0}</td>
                <td>${entrada.felicidad ?? 0}%</td>
                <td style="text-align:center">${entrada.turno}</td>
                <td>${entrada.fecha ?? '—'}</td>
            </tr>
        `;
    }).join('');
}

// ── Card ciudad actual ───────────────────────────────────────

function mostrarMiCiudad(top10, todas, ciudadActualId, ctrlRanking) {
    if (!ciudadActualId) return;

    const posicion = ctrlRanking.getPosicion(ciudadActualId);
    const entrada  = ctrlRanking.getEntrada(ciudadActualId);

    if (!entrada || posicion === -1) return;

    const estaEnTop10 = top10.some(e => e.ciudadId === ciudadActualId);

    if (estaEnTop10) {
        // Mostrar card destacada encima de la tabla
        const card   = document.getElementById('mi-ciudad-card');
        const nombre = document.getElementById('mi-ciudad-nombre');
        const pos    = document.getElementById('mi-ciudad-posicion');
        const score  = document.getElementById('mi-ciudad-score');

        if (nombre) nombre.textContent = entrada.nombre;
        if (pos)    pos.textContent    = `#${posicion}`;
        if (score)  score.textContent  = `${entrada.score.toLocaleString('es-CO')} pts`;
        card?.classList.remove('oculto');
    } else {
        // Mostrar banner "Tu ciudad: #XX" debajo de la tabla
        const fuera   = document.getElementById('mi-ciudad-fuera');
        const posFuera = document.getElementById('mi-ciudad-pos-fuera');
        const nomFuera = document.getElementById('mi-ciudad-nombre-fuera');
        const scFuera  = document.getElementById('mi-ciudad-score-fuera');

        if (posFuera) posFuera.textContent = `#${posicion}`;
        if (nomFuera) nomFuera.textContent = entrada.nombre;
        if (scFuera)  scFuera.textContent  = entrada.score.toLocaleString('es-CO');
        fuera?.classList.remove('oculto');
    }
}

// ── Eventos ──────────────────────────────────────────────────

function registrarEventos(ctrlRanking) {

    // Volver al juego
    document.getElementById('btn-volver')?.addEventListener('click', () => {
        window.location.href = 'juego.html';
    });

    // Exportar ranking como JSON
    document.getElementById('btn-exportar-json')?.addEventListener('click', () => {
        ctrlRanking.exportar();
    });

    // Limpiar ranking
    document.getElementById('btn-limpiar')?.addEventListener('click', () => {
        if (confirm('¿Seguro que quieres limpiar el ranking? Esta accion no se puede deshacer.')) {
            ctrlRanking.limpiar();
            renderizarTabla([], null);
            document.getElementById('mi-ciudad-card')?.classList.add('oculto');
        }
    });
}