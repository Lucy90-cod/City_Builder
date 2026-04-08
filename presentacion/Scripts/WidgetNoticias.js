/**
 * widgetNoticias.js
 * Muestra lista de 5 noticias de NoticiasService.
 * HU-017: imagen (si hay), descripción, enlace, timestamp; carrusel horizontal en móvil.
 * Se actualiza cada 30 minutos.
 */

import { NoticiasService } from '../../negocio/Servicios/NoticiasService.js';

function escHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escAttr(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

function urlHttpOk(u) {
    return typeof u === 'string' && /^https?:\/\//i.test(u.trim());
}

export class WidgetNoticias {

    #countryCode;
    #intervalo;
    static #INTERVALO_MS = 30 * 60 * 1000;

    /**
     * @param {string} countryCode - Codigo ISO 2 letras. Ej: 'co'
     */
    constructor(countryCode = 'co') {
        this.#countryCode = countryCode;
    }

    async init() {
        await this.#actualizar();
        this.#intervalo = setInterval(() => this.#actualizar(), WidgetNoticias.#INTERVALO_MS);
    }

    detener() {
        if (this.#intervalo) clearInterval(this.#intervalo);
    }

    #formatearFecha(iso) {
        if (!iso) return '';
        try {
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return '';
            return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
        } catch {
            return '';
        }
    }

    /**
     * @param {object} n
     * @returns {string}
     */
    #htmlNoticia(n) {
        const titulo   = escHtml(n.titulo);
        const descripcionRaw = String(n.descripcion ?? '').trim();
        const maxDesc  = 280;
        const descCort = descripcionRaw.length > maxDesc
            ? descripcionRaw.slice(0, maxDesc) + '…'
            : descripcionRaw;
        const descripcion = escHtml(descCort);
        const fuente    = escHtml(n.fuente);
        const url       = urlHttpOk(n.url) ? n.url.trim() : '#';
        const fechaTxt  = this.#formatearFecha(n.fechaIso);
        const imagenSrc = urlHttpOk(n.imagen) ? n.imagen.trim() : '';

        const timeHtml = fechaTxt && n.fechaIso
            ? `<time class="noticia-fecha" datetime="${escAttr(n.fechaIso)}">${escHtml(fechaTxt)}</time>`
            : '';

        const metaInner = timeHtml
            ? `${timeHtml}<span class="noticia-meta-sep" aria-hidden="true"> · </span><span class="noticia-fuente">${fuente}</span>`
            : `<span class="noticia-fuente">${fuente}</span>`;

        const thumb = imagenSrc
            ? `<div class="noticia-thumb">
                <img src="${escAttr(imagenSrc)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">
               </div>`
            : '';

        const claseExtra = imagenSrc ? '' : ' noticia-item--sin-thumb';

        return `
            <article class="noticia-item${claseExtra}">
                ${thumb}
                <div class="noticia-cuerpo">
                    <a href="${escAttr(url)}" target="_blank" rel="noopener noreferrer" class="noticia-titulo">${titulo}</a>
                    <p class="noticia-meta">${metaInner}</p>
                    ${descripcion ? `<p class="noticia-descripcion">${descripcion}</p>` : ''}
                </div>
            </article>`;
    }

    async #actualizar() {
        const contenedor      = document.getElementById('widget-noticias');
        const contenedorMovil = document.getElementById('widget-noticias-movil');
        if (!contenedor && !contenedorMovil) return;

        try {
            const noticias = await NoticiasService.getNoticias(this.#countryCode);

            if (!noticias.length) {
                const vacio = `<p class="widget-placeholder">Sin noticias disponibles</p>`;
                if (contenedor) contenedor.innerHTML = vacio;
                if (contenedorMovil) contenedorMovil.innerHTML = vacio;
                return;
            }

            const items = noticias.map(n => this.#htmlNoticia(n)).join('');

            if (contenedor) contenedor.innerHTML = items;
            if (contenedorMovil)
                contenedorMovil.innerHTML = `<div class="noticias-carrusel-inner" role="list">${items}</div>`;

        } catch (e) {
            const err = `<p class="widget-placeholder">Noticias no disponibles</p>`;
            if (contenedor) contenedor.innerHTML = err;
            if (contenedorMovil) contenedorMovil.innerHTML = err;
        }
    }
}
