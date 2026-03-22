/**
 * Modal que aparece al hacer click en una celda con edificio.
 * Tiene dos modos:
 *   - abrir()            → info del edificio + botón Demoler (modo normal)
 *   - abrirConfirmacion() → confirmación "¿Demoler X?" antes de demoler (modo demolición)
 */

export class ModalEdificio {

    #ctrlEdificio;
    #renderer;
    #notificaciones;

    // Elementos del DOM
    #modal;
    #overlay;
    #btnCerrar;
    #btnDemoler;
    #imgEdificio;
    #nombreEdificio;
    #descripcionEdificio;
    #statsEdificio;

    // Estado
    #edificioActual;

    constructor(ctrlEdificio, renderer, notificaciones) {
        this.#ctrlEdificio   = ctrlEdificio;
        this.#renderer       = renderer;
        this.#notificaciones = notificaciones;
        this.#edificioActual = null;
    }

    // ── Inicializacion ───────────────────────────────────────

    init() {
        this.#modal               = document.getElementById('modal-edificio');
        this.#overlay             = document.getElementById('modal-overlay');
        this.#btnCerrar           = document.getElementById('modal-btn-cerrar');
        this.#btnDemoler          = document.getElementById('modal-btn-demoler');
        this.#imgEdificio         = document.getElementById('modal-img-edificio');
        this.#nombreEdificio      = document.getElementById('modal-nombre-edificio');
        this.#descripcionEdificio = document.getElementById('modal-descripcion');
        this.#statsEdificio       = document.getElementById('modal-stats');

        this.#registrarEventos();
    }

    // ── Eventos ──────────────────────────────────────────────

    #registrarEventos() {
        this.#btnCerrar.addEventListener('click',  () => this.cerrar());
        this.#overlay.addEventListener('click',    () => this.cerrar());
        this.#btnDemoler.addEventListener('click', () => this.#demoler());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cerrar();
        });
    }

    // ── Abrir en modo INFO (normal) ──────────────────────────

    /**
     * Muestra la información del edificio con botón Demoler.
     * Se usa al hacer click en modo normal.
     * @param {Edificio} edificio
     */
    abrir(edificio) {
        this.#edificioActual = edificio;

        const info = edificio.getInfo();
        const nombre = this.#formatearTitulo(info.tipo, info.subtipo);

        this.#imgEdificio.src             = info.imagen;
        this.#imgEdificio.alt             = nombre;
        this.#imgEdificio.style.display   = '';
        this.#nombreEdificio.textContent  = nombre;
        this.#descripcionEdificio.textContent = info.descripcion;
        this.#statsEdificio.innerHTML     = this.#generarStats(info, edificio);
        this.#btnDemoler.textContent      = '🔨 Demoler';
        this.#btnDemoler.style.display    = '';

        this.#overlay.classList.add('visible');
        this.#modal.classList.add('visible');
    }

    // ── Abrir en modo CONFIRMACIÓN (demolición) ──────────────

    /**
     * Muestra un diálogo de confirmación antes de demoler.
     * Se usa al hacer click en modo demolición.
     * @param {Edificio} edificio
     * @param {number}   ciudadanosAfectados
     */
    abrirConfirmacion(edificio, ciudadanosAfectados = 0) {
        this.#edificioActual = edificio;

        const info     = edificio.getInfo();
        const nombre   = this.#formatearTitulo(info.tipo, info.subtipo);
        const reembolso = Math.floor(info.costo * 0.5);

        // Ocultar imagen — no es necesaria en confirmación
        this.#imgEdificio.style.display = 'none';

        // Título como pregunta
        this.#nombreEdificio.textContent = `¿Demoler ${nombre}?`;

        // Descripción con reembolso
        this.#descripcionEdificio.textContent =
            `Esta acción no se puede deshacer. Recibirás $${reembolso.toLocaleString()} (50% del costo).`;

        // Stats: solo advertencia de ciudadanos si aplica
        this.#statsEdificio.innerHTML = this.#generarStatsConfirmacion(ciudadanosAfectados);

        // Botón de confirmación
        this.#btnDemoler.textContent   = '✓ Sí, demoler';
        this.#btnDemoler.style.display = '';

        this.#overlay.classList.add('visible');
        this.#modal.classList.add('visible');
    }

    cerrar() {
        this.#modal.classList.remove('visible');
        this.#overlay.classList.remove('visible');
        this.#edificioActual = null;
    }

    // ── Demoler ──────────────────────────────────────────────

    #manejarClickDemoler() {
    if (!this.#edificioActual) return;

    // Si ya estamos en modo confirmación → demoler directamente
    if (this.#btnDemoler.textContent.includes('Sí, demoler')) {
        this.#demoler();
        return;
    }

    // 1. Calcular afectados
    const id = this.#edificioActual.getId();
    const afectados = this.#ctrlEdificio.calcularAfectados(id);

    // 2. Abrir modal de confirmación
    this.abrirConfirmacion(this.#edificioActual, afectados);
    }
    
    
    #demoler() {
        
        if (!this.#edificioActual) return;

        const id        = this.#edificioActual.getId();
        const pos       = this.#edificioActual.getPosicion();
        const resultado = this.#ctrlEdificio.demoler(id);

        if (resultado.ok) {
            this.#renderer.actualizarCelda(pos.x, pos.y);
            this.#notificaciones.mostrarExito(resultado.mensaje);
            this.cerrar();
        } else {
            this.#notificaciones.mostrarError(resultado.mensaje);
        }
    
    }

    // ── Helpers de UI ────────────────────────────────────────

    #formatearTitulo(tipo, subtipo) {
        const nombres = {
            residencial: { casa: 'Casa Simpson',          apartamento: 'Apartamento Springfield' },
            comercial:   { tienda: 'Kwik-E-Mart',         centroComercial: 'Springfield Mall' },
            industrial:  { fabrica: 'Planta Nuclear',     granja: 'Granja Springfield' },
            servicio:    { policia: 'Comisaria Wiggum',   bomberos: 'Bomberos Springfield', hospital: 'Hospital Springfield' },
            planta:      { electrica: 'Planta Electrica', agua: 'Planta de Agua' },
            parque:      { parque: 'Parque Springfield' },
        };
        return nombres[tipo]?.[subtipo] ?? `${tipo} — ${subtipo}`;
    }

    /** Stats completos para modo info */
    #generarStats(info, edificio) {
        const consumo    = edificio.calcularConsumo();
        const produccion = edificio.calcularProduccion();
        const filas      = [];

        filas.push(`<div class="stat"><span>Costo construccion</span><span>$${info.costo.toLocaleString()}</span></div>`);
        filas.push(`<div class="stat"><span>Mantenimiento/turno</span><span>$${edificio.getCostoMantenimiento()}</span></div>`);

        if (consumo.electricidad) filas.push(`<div class="stat consumo"><span>⚡ Consume electricidad</span><span>${consumo.electricidad}/turno</span></div>`);
        if (consumo.agua)         filas.push(`<div class="stat consumo"><span>💧 Consume agua</span><span>${consumo.agua}/turno</span></div>`);

        if (produccion.money)       filas.push(`<div class="stat produccion"><span>💰 Genera dinero</span><span>$${produccion.money}/turno</span></div>`);
        if (produccion.electricity) filas.push(`<div class="stat produccion"><span>⚡ Produce electricidad</span><span>${produccion.electricity}/turno</span></div>`);
        if (produccion.water)       filas.push(`<div class="stat produccion"><span>💧 Produce agua</span><span>${produccion.water}/turno</span></div>`);
        if (produccion.food)        filas.push(`<div class="stat produccion"><span>🌽 Produce alimentos</span><span>${produccion.food}/turno</span></div>`);

        if (info.capacidad !== undefined)
            filas.push(`<div class="stat"><span>👥 Capacidad</span><span>${info.ocupantes}/${info.capacidad}</span></div>`);
        if (info.empleos !== undefined)
            filas.push(`<div class="stat"><span>💼 Empleos</span><span>${info.empleados}/${info.empleos}</span></div>`);
        if (info.radio !== undefined)
            filas.push(`<div class="stat"><span>📡 Radio de efecto</span><span>${info.radio} celdas</span></div>`);
        if (info.beneficioFelicidad !== undefined)
            filas.push(`<div class="stat"><span>😊 Beneficio felicidad</span><span>+${info.beneficioFelicidad}</span></div>`);

        filas.push(`<div class="stat"><span>📍 Posicion</span><span>(${info.posicion.x}, ${info.posicion.y})</span></div>`);

        return filas.join('');
    }

    /** Stats simplificados para modo confirmación */
    #generarStatsConfirmacion(ciudadanosAfectados) {
        if (ciudadanosAfectados === 0) return '';
        return `<div class="stat consumo">
            <span>⚠️ Ciudadanos que perderán hogar o empleo</span>
            <span>${ciudadanosAfectados}</span>
        </div>`;
    }
}




