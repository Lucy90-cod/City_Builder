/**
 * Consume la API de OpenWeatherMap para obtener el clima actual
 * de la ciudad segun sus coordenadas geograficas.
 *
 * Endpoint: GET https://api.openweathermap.org/data/2.5/weather
 *           ?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=es
 *
 * IMPORTANTE: La API_KEY debe estar en una variable de entorno o
 * configuracion — NUNCA hardcodeada en el codigo.
 */

export class ClimaService {

    static #BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
    static #API_KEY  = '1faac14b0abf89760a76cad417149e85';   // Se asigna con ClimaService.setApiKey()

    static setApiKey(key) {
        ClimaService.#API_KEY = key;
    }

    /**
     * Obtiene el clima actual para las coordenadas dadas.
     * @param {number} lat
     * @param {number} lon
     * @returns {Promise<Object>} Objeto formateado con los datos del clima
     */
   static async getClima(lat, lon) {
        if (!ClimaService.#API_KEY) {
            console.warn('ClimaService: falta API_KEY. Llama ClimaService.setApiKey(key) primero.');
            return ClimaService.#climaFallback();
        }

        try {
            const url = `${ClimaService.#BASE_URL}?lat=${lat}&lon=${lon}&appid=${ClimaService.#API_KEY}&units=metric&lang=es`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return ClimaService.formatear(data);

        } catch (error) {
            console.error('ClimaService.getClima() fallo:', error.message);
            return ClimaService.#climaFallback();
        }
    }

    /**
     * Transforma la respuesta cruda de OpenWeatherMap en un objeto limpio.
     * @param {Object} data - Respuesta JSON de la API
     * @returns {{ temperatura, descripcion, icono, humedad, viento, ciudad }}
     */
    static formatear(data) {
        const codigo = data.weather?.[0]?.icon ?? '01d';
        return {
            temperatura:  Math.round(data.main?.temp ?? 0),
            descripcion:  data.weather?.[0]?.description ?? 'sin datos',
            codigoIcono:  codigo,
            icono:        `https://openweathermap.org/img/wn/${codigo}@2x.png`,
            humedad:      data.main?.humidity ?? 0,
            viento:       Math.round((data.wind?.speed ?? 0) * 3.6), // m/s a km/h
            ciudad:       data.name ?? 'Springfield',
        };
    }

    /** Datos de fallback cuando la API no esta disponible */
    static #climaFallback() {
        return {
            temperatura:  22,
            descripcion:  'Springfield — datos no disponibles',
            codigoIcono:  '02d',
            icono:        'assets/fondo/clima_default.png',
            humedad:      60,
            viento:       10,
            ciudad:       'Springfield',
        };
    }
}