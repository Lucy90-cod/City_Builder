/**
 * widgetNoticias.js
 * Muestra lista de 5 noticias de NoticiasService.
 * Se actualiza cada 30 minutos.
 */

import { NoticiasService } from '../../negocio/Servicios/NoticiasService.js';

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

    async #actualizar() {
        const contenedor = document.getElementById('widget-noticias');
        if (!contenedor) return;

        try {
            const noticias = await NoticiasService.getNoticias(this.#countryCode);

            if (!noticias.length) {
                contenedor.innerHTML = `<p class="widget-placeholder">Sin noticias disponibles</p>`;
                return;
            }

            contenedor.innerHTML = noticias.map(n => `
                 <div class="noticia-item">
                    <a href="${n.url}" target="_blank" class="noticia-titulo">${n.titulo}</a>
                    <p class="noticia-descripcion">${n.descripcion}</p>
                    <span class="noticia-fuente">${n.fuente}</span>
                </div>
            `).join('');

        } catch (e) {
            contenedor.innerHTML = `<p class="widget-placeholder">Noticias no disponibles</p>`;
        }
    }
}