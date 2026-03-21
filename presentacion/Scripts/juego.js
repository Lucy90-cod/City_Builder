/**
 * juego.js
 * Script principal del juego.
 */

import { ControladorCiudad } from '../../negocio/ControladorCiudad.js';
import { ControladorTurno } from '../../negocio/ControladorTurno.js';
import { ControladorEdificio } from '../../negocio/ControladorEdificio.js';
import { ControladorMapa } from '../../negocio/ControladorMapa.js';
import { ControladorRuta } from '../../negocio/ControladorRuta.js';
import { ControladorCiudadano } from '../../negocio/ControladorCiudadano.js';
import { ControladorRanking } from '../../negocio/ControladorRanking.js';
import { MapaRenderer } from './MapaRenderer.js';
import { MenuConstruccion } from './MenuConstruccion.js';
import { ModalEdificio } from './ModalEdificio.js';
import { PanelRecursos } from './PanelRecursos.js';
import { Notificaciones } from './Notificaciones.js';
import { renderWidgetClima } from './WidgetClima.js';
import { WidgetNoticias } from './WidgetNoticias.js';
import { PantallaGameOver } from './PantallaGameOver.js';

let ciudad = null;
let ctrlTurno = null;
let ctrlEdificio = null;
let ctrlMapa = null;
let ctrlRuta = null;
let ctrlCiudadano = null;
let ctrlRanking = null;
let renderer = null;
let menuConstr = null;
let modalEdificio = null;
let widgetNoticias = null;
let edificiosMap = null;
let ctrlCiudad = null;

document.addEventListener('DOMContentLoaded', inicializar);

async function inicializar() {
    ctrlCiudad = new ControladorCiudad();
    ciudad = ctrlCiudad.cargar();

    if (!ciudad) {
        Notificaciones.mostrarError('No hay ciudad guardada. Crea una primero.');
        setTimeout(() => window.location.href = '../../../index.html', 2000);
        return;
    }

    ctrlEdificio = new ControladorEdificio(ciudad);
    ctrlMapa = new ControladorMapa(ciudad);
    ctrlRuta = new ControladorRuta(ciudad);
    ctrlCiudadano = new ControladorCiudadano(ciudad);
    ctrlRanking = new ControladorRanking();

    edificiosMap = new Map(ciudad.getEdificios().map(e => [e.getId(), e]));

    const contenedor = document.getElementById('mapa-grid');

    renderer = new MapaRenderer(
        contenedor,
        ciudad.getMapa(),
        edificiosMap,
        (x, y, celda) => manejarClickCelda(x, y, celda)
    );
    renderer.renderizar();

    menuConstr = new MenuConstruccion(ctrlEdificio, ctrlMapa, renderer, Notificaciones);
    menuConstr.init();
    menuConstr.setControladorRuta(ctrlRuta);

    modalEdificio = new ModalEdificio(ctrlEdificio, renderer, Notificaciones);
    modalEdificio.init();

    PanelRecursos.actualizar(ciudad);
    PanelRecursos.actualizarFelicidad(ctrlCiudadano.getFelicidadPromedio());

    ctrlTurno = new ControladorTurno(
        ciudad,
        onTurnoCompletado,
        onGameOver,
        30
    );
    ctrlTurno.iniciar();

    const coords = ciudad.getCoordenadas();
    renderWidgetClima(ciudad.getRegion(), coords.lat, coords.lon);
    widgetNoticias = new WidgetNoticias('co');
    widgetNoticias.init();

    registrarEventos();
}

function actualizarEdificiosMap() {
    ciudad.getEdificios().forEach(e => {
        if (!edificiosMap.has(e.getId())) {
            edificiosMap.set(e.getId(), e);
        }
    });
}

function onTurnoCompletado(ciudadActualizada) {
    ciudad = ciudadActualizada;
    actualizarEdificiosMap();
    PanelRecursos.actualizar(ciudad);
    PanelRecursos.actualizarFelicidad(ctrlCiudadano.getFelicidadPromedio());

    const sinVivienda = document.getElementById('stat-sin-vivienda');
    const desempleados = document.getElementById('stat-desempleados');
    if (sinVivienda) sinVivienda.textContent = ctrlCiudadano.getTotalSinVivienda();
    if (desempleados) desempleados.textContent = ctrlCiudadano.getTotalDesempleados();

    renderer.actualizarTodo();
    ctrlRanking.registrarCiudad(ciudad);
}

function onGameOver(ciudadFinal, causa) {
    renderer.setModoNormal();
    document.getElementById('select-tipo-edificio').disabled = true;
    document.getElementById('btn-construir-via').disabled    = true;
    document.getElementById('btn-demoler').disabled          = true;

    ctrlRanking.registrarGameOver(ciudadFinal);

    PantallaGameOver.mostrar(
        ciudadFinal,
        causa,
        () => window.location.reload(),
        () => { window.location.href = '../../../index.html'; }
    );
}

function manejarClickCelda(x, y, celda) {
    const modo = menuConstr?.getModoActual() ?? 'normal';

    if (modo === 'via') {
        menuConstr.manejarClickCelda(x, y);
        PanelRecursos.actualizar(ciudad);
        return;
    }

    if (modo === 'construccion') {
        menuConstr.manejarClickCelda(x, y);
        actualizarEdificiosMap();
        renderer.actualizarCelda(x, y);
        PanelRecursos.actualizar(ciudad);
        return;
    }

    if (modo === 'demolicion') {
        if (celda.isVia()) {
            const res = ctrlMapa.eliminarVia(x, y);
            if (res.ok) {
                renderer.actualizarCelda(x, y);
                PanelRecursos.actualizar(ciudad);
                Notificaciones.mostrarExito(res.mensaje);
            } else {
                Notificaciones.mostrarError(res.mensaje);
            }
        } else if (celda.isEdificio()) {
            const edificio = ciudad.getEdificioPorId(celda.getEdificioId());
            if (edificio) {
                const afectados = ciudad.getCiudadanos().filter(c =>
                    c.getEdificioResidencialId() === edificio.getId() ||
                    c.getEdificioTrabajoId()     === edificio.getId()
                ).length;
                modalEdificio.abrirConfirmacion(edificio, afectados);
            }
        }
        return;
    }

    // Modo normal — abrir modal si hay edificio
    if (celda.isEdificio()) {
        const edificio = ciudad.getEdificioPorId(celda.getEdificioId());
        if (edificio) modalEdificio.abrir(edificio);
    }
}

function registrarEventos() {
    const btnPausar = document.getElementById('btn-pausar');
    btnPausar?.addEventListener('click', () => {
        if (ctrlTurno.isEnEjecucion()) {
            ctrlTurno.pausar();
            btnPausar.textContent = '▶ Reanudar';
            Notificaciones.mostrarInfo('Turno pausado');
        } else {
            ctrlTurno.reanudar();
            btnPausar.textContent = '⏸ Pausar';
            Notificaciones.mostrarInfo('Turno reanudado');
        }
    });

    document.getElementById('btn-exportar')?.addEventListener('click', () => {
        ctrlCiudad.exportarJSON();
        Notificaciones.mostrarExito('Ciudad exportada correctamente');
    });

    document.getElementById('btn-guardar')?.addEventListener('click', () => {
        ctrlCiudad.guardar();
        Notificaciones.mostrarExito('Ciudad guardada correctamente');
    });

    document.getElementById('btn-ranking')?.addEventListener('click', () => {
        ctrlTurno.pausar();
        window.location.href = 'Ranking.html';
    });

    document.getElementById('input-duracion')?.addEventListener('change', (e) => {
        const seg = parseInt(e.target.value);
        if (seg >= 5) {
            ctrlTurno.setDuracion(seg);
            Notificaciones.mostrarInfo(`Turno cada ${seg} segundos`);
        }
    });

    // ── Atajos de teclado ────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        // No interferir mientras se escribe en inputs/selects
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        switch (e.key) {
            case 'b': case 'B':
                // Abrir menú de construcción: enfocar el selector de tipo
                document.getElementById('select-tipo-edificio')?.focus();
                Notificaciones.mostrarInfo('B — Menú de construcción');
                break;

            case 'r': case 'R':
                // Modo construcción de vías
                document.getElementById('btn-construir-via')?.click();
                break;

            case 'd': case 'D':
                // Modo demolición
                document.getElementById('btn-demoler')?.click();
                break;

            case 'Escape':
                // Cancelar modo actual
                document.getElementById('btn-cancelar')?.click();
                break;

            case ' ':
                // Pausar / Reanudar — prevenir scroll de página
                e.preventDefault();
                document.getElementById('btn-pausar')?.click();
                break;

            case 's': case 'S':
                // Guardar (solo sin Ctrl/Cmd para no sobrepasar el atajo del navegador)
                if (!e.ctrlKey && !e.metaKey) {
                    ctrlCiudad.guardar();
                    Notificaciones.mostrarExito('Ciudad guardada correctamente');
                }
                break;
        }
    });
}