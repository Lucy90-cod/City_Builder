/**
 * funciones.js
 * Funciones utilitarias puras reutilizables en toda la aplicacion.
 * Sin efectos secundarios, sin dependencias del dominio.
 */

// ── IDs ──────────────────────────────────────────────────────────────────────

/**
 * Genera un ID unico con prefijo y timestamp.
 * Uso: generarId('c')     → 'c_1748000000000_1'
 *      generarId('R1', 3) → 'R1_1748000000000_3'
 *
 * @param {string} prefijo
 * @param {number} [contador=0] - numero secuencial para evitar colisiones si se llama en el mismo ms
 * @returns {string}
 */
export function generarId(prefijo, contador = 0) {
    return `${prefijo}_${Date.now()}_${contador}`;
}

/**
 * Genera un ID de edificio a partir del tipo, subtipo y un contador.
 * Ejemplo: generarIdEdificio('residencial', 'casa', 5) → 'rc_1748000000000_5'
 *
 * @param {string} tipo
 * @param {string} subtipo
 * @param {number} contador
 * @returns {string}
 */
export function generarIdEdificio(tipo, subtipo, contador) {
    const prefijo = `${tipo[0]}${subtipo ? subtipo[0] : 'x'}`;
    return generarId(prefijo, contador);
}

/**
 * Genera un ID de edificio cargado desde archivo .txt (HU-002).
 * Incluye la posicion para garantizar unicidad en el mapa.
 * Ejemplo: idDesdeArchivo('R1', 3, 7) → 'R1_3_7'
 *
 * @param {string} codigo - codigo del grid (R1, C2, etc.)
 * @param {number} x
 * @param {number} y
 * @returns {string}
 */
export function idDesdeArchivo(codigo, x, y) {
    return `${codigo}_${x}_${y}`;
}

// ── Geometria ────────────────────────────────────────────────────────────────

/**
 * Calcula la distancia euclidiana entre dos posiciones del grid.
 * Usada para verificar radio de servicios y parques.
 *
 * @param {{ x: number, y: number }} posA
 * @param {{ x: number, y: number }} posB
 * @returns {number}
 */
export function distanciaEuclidiana(posA, posB) {
    const dx = posA.x - posB.x;
    const dy = posA.y - posB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Verifica si posA esta dentro del radio de posB.
 *
 * @param {{ x: number, y: number }} posA
 * @param {{ x: number, y: number }} posB
 * @param {number} radio
 * @returns {boolean}
 */
export function enRadio(posA, posB, radio) {
    return distanciaEuclidiana(posA, posB) <= radio;
}

/**
 * Devuelve las 4 posiciones ortogonales adyacentes a (x, y).
 * No filtra fuera del mapa — el llamador debe validar.
 *
 * @param {number} x
 * @param {number} y
 * @returns {{ x: number, y: number }[]}
 */
export function posicionesAdyacentes(x, y) {
    return [
        { x,     y: y - 1 },
        { x,     y: y + 1 },
        { x: x - 1, y },
        { x: x + 1, y },
    ];
}

// ── Numeros ──────────────────────────────────────────────────────────────────

/**
 * Limita un valor entre un minimo y un maximo.
 * Ejemplo: clamp(150, 0, 100) → 100
 *
 * @param {number} valor
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(valor, min, max) {
    return Math.max(min, Math.min(max, valor));
}

/**
 * Calcula el promedio de un array de numeros.
 * Devuelve el valor por defecto si el array esta vacio.
 *
 * @param {number[]} valores
 * @param {number} [porDefecto=0]
 * @returns {number}
 */
export function promedio(valores, porDefecto = 0) {
    if (valores.length === 0) return porDefecto;
    return valores.reduce((suma, v) => suma + v, 0) / valores.length;
}

/**
 * Redondea a un numero entero redondeando hacia abajo.
 * Alias de Math.floor con nombre semantico.
 *
 * @param {number} valor
 * @returns {number}
 */
export function entero(valor) {
    return Math.floor(valor);
}

// ── Texto ────────────────────────────────────────────────────────────────────

/**
 * Formatea un numero como moneda colombiana: $1,234,567
 *
 * @param {number} valor
 * @returns {string}
 */
export function formatearDinero(valor) {
    return `$${Math.round(valor).toLocaleString('es-CO')}`;
}

/**
 * Formatea un numero con separadores de miles: 1,234,567
 *
 * @param {number} valor
 * @returns {string}
 */
export function formatearNumero(valor) {
    return Math.round(valor).toLocaleString('es-CO');
}

// ── Tiempo ───────────────────────────────────────────────────────────────────

/**
 * Verifica si han pasado al menos `minutos` desde `timestampMs`.
 * Util para controlar el cache de las APIs externas (clima, noticias).
 *
 * @param {number} timestampMs - Date.now() del ultimo fetch
 * @param {number} minutos
 * @returns {boolean}
 */
export function haExpirado(timestampMs, minutos) {
    return (Date.now() - timestampMs) >= minutos * 60 * 1000;
}
