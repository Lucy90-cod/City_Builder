/**
 * widgetClima.js
 * Muestra temperatura e icono en el panel derecho.
 * Delega el fetch a ClimaService.
 * Se actualiza cada 30 minutos.
 */

import { ClimaService } from '../../negocio/Servicios/ClimaService.js';

// Configurar API key una sola vez al importar
ClimaService.setApiKey('c6b1a6cf379dda5f9ff2cc7fbbc65acc');

const TIEMPO_ACTUALIZACION = 30 * 60 * 1000; //tiempo, milisegundos

/** Clase CSS de animación según código OpenWeatherMap (p. ej. 01d, 10n) — HU-016 icono animado */
function claseAnimacionIcono(codigo) {
    if (!codigo || String(codigo).length < 2) return 'clima-anim--pulso';
    const id = String(codigo).slice(0, 2);
    if (id === '01') return 'clima-anim--sol';
    if (id === '02') return 'clima-anim--nubes';
    if (id === '03' || id === '04') return 'clima-anim--nublado';
    if (id === '09' || id === '10') return 'clima-anim--lluvia';
    if (id === '11') return 'clima-anim--tormenta';
    if (id === '13') return 'clima-anim--nieve';
    if (id === '50') return 'clima-anim--niebla';
    return 'clima-anim--pulso';
}

// ── Funciones de render ──────────────────────────────────────

function renderCargando(contenedor, region) {
    contenedor.innerHTML = `
            <div class="tarjeta-clima">
            <p><strong>Región:</strong> ${region}</p>
            <p>Cargando clima...</p>
        </div>
    `;
}

function renderError(contenedor, region, mensaje = 'No fue posible cargar el clima.') {
    contenedor.innerHTML = `
        <div class="tarjeta-clima">
            <p><strong>Región:</strong> ${region}</p>
            <p>${mensaje}</p>
        </div>
    `;
}

function renderClima(contenedor, region, clima) {
    const codigo = clima.codigoIcono ?? '01d';
    const anim   = claseAnimacionIcono(codigo);
    contenedor.innerHTML = `
        <div class="tarjeta-clima">
            <div class="clima-icono-wrap" aria-hidden="true">
                <img src="${clima.icono}" alt="${clima.descripcion}"
                    class="clima-icono clima-icono-animado ${anim}"
                    data-clima-icon="${codigo}">
            </div>
            <div class="clima-datos">
                <p><strong>Región:</strong> ${region}</p>
                <p><strong>Temperatura:</strong> ${clima.temperatura} °C</p>
                <p><strong>Condición:</strong> ${clima.descripcion}</p>
                <p><strong>Humedad:</strong> ${clima.humedad}%</p>
                <p><strong>Viento:</strong> ${clima.viento} km/h</p>
            </div>
        </div>
    `;
}

// ── Funcion principal exportada ──────────────────────────────

export function renderWidgetClima(region, latitud, longitud) {
    const contenedor = document.getElementById('widget-clima');
    if (!contenedor) return;

    async function cargarClima() {
        try {
            renderCargando(contenedor, region);

            if (latitud == null || longitud == null) {
                throw new Error('Faltan coordenadas para consultar el clima.');
            }

            const clima = await ClimaService.getClima(latitud, longitud);
            renderClima(contenedor, region, clima);

        } catch (error) {
            renderError(contenedor, region, error.message);
            console.error(error);
        }
    }

    cargarClima();
    setInterval(cargarClima, TIEMPO_ACTUALIZACION);
}