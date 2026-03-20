/**
 * Calcula rutas optimas entre dos puntos del mapa.
 * El algoritmo Dijkstra lo ejecuta el microservicio del profesor.
 *
 * Microservicio: POST http://127.0.0.1:5000/api/calculate-route
 * Convencion:    0 = no transitable, 1 = via transitable
 * Coordenadas:   [fila, columna] = [y, x]
 *
 * Errores del microservicio:
 *   400 → el edificio origen o destino no tiene via adyacente
 *   404 → hay vias pero no existe conexion entre los dos puntos
 */

export class ControladorRuta {

    #ciudad;
    #rutaActual;
    #URL_SERVICIO = 'http://127.0.0.1:5000/api/calculate-route';

    constructor(ciudad) {
        this.#ciudad     = ciudad;
        this.#rutaActual = null;
    }

    getRutaActual() { return this.#rutaActual; }
    limpiarRuta()   { this.#rutaActual = null; }

    /**
     * Envia el mapa y los puntos al microservicio y retorna la ruta.
     * @param {{ x: number, y: number }} origen
     * @param {{ x: number, y: number }} destino
     * @returns {Promise<{ ok: boolean, ruta: Array<{x,y}>|null, mensaje: string }>}
     */
    async calcularRuta(origen, destino) {
        try {
            const body = {
                map:   this.#construirMatriz(),
                start: [origen.y,  origen.x],   // [fila, columna]
                end:   [destino.y, destino.x],
            };

            const response = await fetch(this.#URL_SERVICIO, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(body),
            });

            // 400 → edificio sin via adyacente
            if (response.status === 400) {
                this.#rutaActual = null;
                return { ok: false, ruta: null, mensaje: 'Edificio sin via adyacente: imposible calcular ruta' };
            }

            // 404 → no hay conexion entre los puntos
            if (response.status === 404) {
                this.#rutaActual = null;
                return { ok: false, ruta: null, mensaje: 'No existe conexion entre los dos puntos por las vias actuales' };
            }

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();

            // Convertir [fila, columna] → { x, y }
            this.#rutaActual = data.route.map(([fila, columna]) => ({
                x: columna,
                y: fila,
            }));

            return { ok: true, ruta: this.#rutaActual, mensaje: `Ruta encontrada: ${this.#rutaActual.length} pasos` };

        } catch (error) {
            console.error('ControladorRuta.calcularRuta() fallo:', error.message);
            this.#rutaActual = null;
            return { ok: false, ruta: null, mensaje: 'Microservicio no disponible. Verifica que este corriendo en puerto 5000' };
        }
    }

    #construirMatriz() {
        return this.#ciudad.getMapa().getMatrizRuta();
    }
}