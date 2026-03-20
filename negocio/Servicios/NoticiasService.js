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
        }));
    }

    static #noticiasFallback() {
        return [
            { titulo: 'Homer pierde su trabajo en la planta nuclear', fuente: 'Springfield Gazette', url: '#', imagen: null },
            { titulo: 'Bart vuelve a suspender en la escuela de Springfield', fuente: 'Springfield Gazette', url: '#', imagen: null },
            { titulo: 'Lisa gana el concurso de saxofon del estado', fuente: 'Springfield Gazette', url: '#', imagen: null },
            { titulo: 'Marge organiza feria de pasteles en el parque', fuente: 'Springfield Gazette', url: '#', imagen: null },
            { titulo: 'Maggie protagoniza nuevo incidente con el chupete', fuente: 'Springfield Gazette', url: '#', imagen: null },
        ];
    }
}