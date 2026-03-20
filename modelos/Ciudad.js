/**
 * Ciudad.js
 * Clase central del juego. Agrupa por composicion:
 * Mapa, Vias, Recurso, Puntuacion, edificios y ciudadanos.
 *
 * Compatible con los campos del formulario de Persona 2:
 *   - acepta 'alcalde' o 'nombreAlcalde'
 *   - acepta 'latitud/longitud' o 'coordenadas: { lat, lon }'
 */

import { Mapa } from './Mapa.js';
import { Vias } from './Vias.js';

export class Ciudad {

    #nombre;
    #nombreAlcalde;
    #region;
    #coordenadas;       // { lat, lon }
    #turnoActual;
    #mapa;
    #recurso;           // asignado por ControladorCiudad
    #puntuacion;        // asignado por ControladorCiudad
    #vias;
    #edificios;
    #ciudadanos;

    /**
     * @param {Object} datos
     * @param {string} datos.nombre
     * @param {string} datos.nombreAlcalde  — o datos.alcalde
     * @param {string} datos.region
     * @param {number} datos.latitud        — o datos.coordenadas.lat
     * @param {number} datos.longitud       — o datos.coordenadas.lon
     * @param {number} datos.ancho          — ancho del mapa (15-30)
     * @param {number} datos.alto           — alto del mapa (15-30)
     */
    constructor(datos) {
        this.#nombre        = datos.nombre        ?? '';
        this.#region        = datos.region        ?? '';
        this.#turnoActual   = 1;
        this.#edificios     = [];
        this.#ciudadanos    = [];
        this.#recurso       = null;
        this.#puntuacion    = null;

        // Compatible con alcalde o nombreAlcalde
        this.#nombreAlcalde = datos.nombreAlcalde ?? datos.alcalde ?? '';

        // Compatible con coordenadas o latitud/longitud
        if (datos.coordenadas) {
            this.#coordenadas = datos.coordenadas;
        } else {
            this.#coordenadas = {
                lat: datos.latitud  ?? 0,
                lon: datos.longitud ?? 0,
            };
        }

        this.#mapa = new Mapa(datos.ancho ?? 15, datos.alto ?? 15);
        this.#vias = new Vias();
    }

    // ── Metodo que llama ControladorCiudad de Persona 2 ─────
    inicializarMapa() {
        // El mapa ya se crea en el constructor.
        // Este metodo existe para compatibilidad con el codigo de Persona 2.
    }

    // ── Getters basicos ──────────────────────────────────────
    getNombre()        { return this.#nombre; }
    getNombreAlcalde() { return this.#nombreAlcalde; }
    getAlcalde()       { return this.#nombreAlcalde; } // alias para Persona 2
    getRegion()        { return this.#region; }
    getCoordenadas()   { return { ...this.#coordenadas }; }
    getLatitud()       { return this.#coordenadas.lat; }
    getLongitud()      { return this.#coordenadas.lon; }
    getTurnoActual()   { return this.#turnoActual; }

    // ── Getters de composicion ───────────────────────────────
    getMapa()       { return this.#mapa; }
    getVias()       { return this.#vias; }
    getRecurso()    { return this.#recurso; }
    getPuntuacion() { return this.#puntuacion; }
    getEdificios()  { return this.#edificios; }
    getCiudadanos() { return this.#ciudadanos; }

    // ── Setters de composicion ───────────────────────────────
    setRecurso(recurso)       { this.#recurso    = recurso; }
    setPuntuacion(puntuacion) { this.#puntuacion = puntuacion; }
    setMapa(mapa)             { this.#mapa       = mapa; }
    setVias(vias)             { this.#vias       = vias; }

    // ── Turno ────────────────────────────────────────────────
    avanzarTurno() { this.#turnoActual++; }

    // ── Edificios ────────────────────────────────────────────
    agregarEdificio(edificio)  { this.#edificios.push(edificio); }

    demolerEdificio(id) {
        const idx = this.#edificios.findIndex(e => e.getId() === id);
        if (idx !== -1) this.#edificios.splice(idx, 1);
    }

    getEdificioPorId(id) {
        return this.#edificios.find(e => e.getId() === id) ?? null;
    }

    // ── Ciudadanos ───────────────────────────────────────────
    agregarCiudadano(ciudadano) { this.#ciudadanos.push(ciudadano); }

    eliminarCiudadano(id) {
        const idx = this.#ciudadanos.findIndex(c => c.getId() === id);
        if (idx !== -1) this.#ciudadanos.splice(idx, 1);
    }

    // ── Estado general ───────────────────────────────────────
    getEstado() {
        return {
            nombre:        this.#nombre,
            nombreAlcalde: this.#nombreAlcalde,
            alcalde:       this.#nombreAlcalde, // alias
            region:        this.#region,
            turnoActual:   this.#turnoActual,
            poblacion:     this.#ciudadanos.length,
            edificios:     this.#edificios.length,
            dinero:        this.#recurso?.getMoney()       ?? 0,
            electricidad:  this.#recurso?.getElectricity() ?? 0,
            agua:          this.#recurso?.getWater()       ?? 0,
            score:         this.#puntuacion?.getScore()    ?? 0,
            ancho:         this.#mapa.getAncho(),
            alto:          this.#mapa.getAlto(),
            latitud:       this.#coordenadas.lat,
            longitud:      this.#coordenadas.lon,
        };
    }

    // ── Serialización ────────────────────────────────────────
    toJSON() {
        return {
            nombre:        this.#nombre,
            nombreAlcalde: this.#nombreAlcalde,
            region:        this.#region,
            coordenadas:   this.#coordenadas,
            turnoActual:   this.#turnoActual,
            mapa:          this.#mapa.toJSON(),
            vias:          this.#vias.toJSON(),
            recurso:       this.#recurso?.toJSON()    ?? null,
            puntuacion:    this.#puntuacion?.toJSON() ?? null,
            edificios:     this.#edificios.map(e => e.toJSON()),
            ciudadanos:    this.#ciudadanos.map(c => c.toJSON()),
        };
    }

    static fromJSON(data) {
        const ciudad = new Ciudad({
            nombre:        data.nombre,
            nombreAlcalde: data.nombreAlcalde ?? data.alcalde,
            region:        data.region,
            coordenadas:   data.coordenadas,
            ancho:         data.mapa?.ancho ?? 15,
            alto:          data.mapa?.alto  ?? 15,
        });

        if (data.mapa) ciudad.setMapa(Mapa.fromJSON(data.mapa));
        if (data.vias) ciudad.setVias(Vias.fromJSON(data.vias));

        ciudad.#turnoActual = data.turnoActual ?? 1;

        ciudad._recursoData    = data.recurso;
        ciudad._puntuacionData = data.puntuacion;
        ciudad._edificiosData  = data.edificios  ?? [];
        ciudad._ciudadanosData = data.ciudadanos ?? [];

        return ciudad;
    }
}