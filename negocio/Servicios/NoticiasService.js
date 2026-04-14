/**
 * NoticiasService.js
 * Consume NewsData.io para obtener titulares actuales.
 *
 * Endpoint: GET https://newsdata.io/api/1/news
 *           ?country={code}&language=es&apikey={KEY}
 *
 * Funciona desde el navegador sin bloqueos.
 * Gratis: 200 peticiones/dia
 */

export class NoticiasService {

    static #BASE_URL = 'https://newsdata.io/api/1/news';
    static #API_KEY = 'pub_742fefcc5625447cacdc0dc1ca383ae5';

    static setApiKey(key) {
        NoticiasService.#API_KEY = key;
    }

    static async getNoticias(countryCode = 'co') {
        if (!NoticiasService.#API_KEY) {
            console.warn('NoticiasService: falta API_KEY');
            return NoticiasService.#noticiasFallback();
        }

        try {
            const url = `${NoticiasService.#BASE_URL}?country=${countryCode}&language=es&apikey=${NoticiasService.#API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return NoticiasService.formatear(data);

        } catch (error) {
            console.error('NoticiasService fallo:', error.message);
            return NoticiasService.#noticiasFallback();
        }
    }

    // NewsData retorna: { results: [ { title, source_id, link, image_url } ] }
    static formatear(data) {
        if (!data.results) return [];
        return data.results.slice(0, 5).map(a => ({
            titulo: a.title || 'Sin titulo',
            descripcion: a.description || a.content || '',
            fuente: a.source_name || a.source_id || 'Desconocido',
            url: a.link || '#',
            imagen: a.image_url || null,
            /** ISO 8601 desde NewsData (pubDate) — para timestamp en UI (HU-017) */
            fechaIso: a.pubDate || null,
        }));
    }

    static #noticiasFallback() {
        const ahora = new Date().toISOString();
        return [
            { titulo: 'Homer pierde su trabajo en la planta nuclear', descripcion: 'Última hora desde la planta nuclear de Springfield.', fuente: 'Springfield Gazette', url: '#', imagen: null, fechaIso: ahora },
            { titulo: 'Bart vuelve a suspender en la escuela de Springfield', descripcion: 'El director Skinner no ha querido hacer comentarios.', fuente: 'Springfield Gazette', url: '#', imagen: null, fechaIso: ahora },
            { titulo: 'Lisa gana el concurso de saxofon del estado', descripcion: 'Otra victoria para la hermana prodigio de la familia.', fuente: 'Springfield Gazette', url: '#', imagen: null, fechaIso: ahora },
            { titulo: 'Marge organiza feria de pasteles en el parque', descripcion: 'Los vecinos esperan la receta secreta de donas glaseadas.', fuente: 'Springfield Gazette', url: '#', imagen: null, fechaIso: ahora },
            { titulo: 'Maggie protagoniza nuevo incidente con el chupete', descripcion: 'Bebé a salvo tras el enésimo percance doméstico.', fuente: 'Springfield Gazette', url: '#', imagen: null, fechaIso: ahora },
        ];
    }
}