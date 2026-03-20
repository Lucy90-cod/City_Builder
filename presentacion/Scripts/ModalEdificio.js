/**
 * Modal que aparece al hacer click en una celda con edificio.
 * Muestra la informacion del edificio y permite demolerlo.
 *
 * El modal debe existir en juego.html con id="modal-edificio".
 * Se abre/cierra con clases CSS — la animacion esta en modal.css
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
    #edificioActual;    // instancia Edificio visible en el modal

    /**
     * @param {ControladorEdificio} ctrlEdificio
     * @param {MapaRenderer}        renderer
     * @param {Object}              notificaciones
     */
    constructor(ctrlEdificio, renderer, notificaciones) {
        this.#ctrlEdificio   = ctrlEdificio;
        this.#renderer       = renderer;
        this.#notificaciones = notificaciones;
        this.#edificioActual = null;
    }

    // ── Inicializacion ───────────────────────────────────────

    init() {
        this.#modal            = document.getElementById('modal-edificio');
        this.#overlay          = document.getElementById('modal-overlay');
        this.#btnCerrar        = document.getElementById('modal-btn-cerrar');
        this.#btnDemoler       = document.getElementById('modal-btn-demoler');
        this.#imgEdificio      = document.getElementById('modal-img-edificio');
        this.#nombreEdificio   = document.getElementById('modal-nombre-edificio');
        this.#descripcionEdificio = document.getElementById('modal-descripcion');
        this.#statsEdificio    = document.getElementById('modal-stats');

        this.#registrarEventos();
    }

    // ── Eventos ──────────────────────────────────────────────

    #registrarEventos() {
        this.#btnCerrar.addEventListener('click',  () => this.cerrar());
        this.#overlay.addEventListener('click',    () => this.cerrar());
        this.#btnDemoler.addEventListener('click', () => this.#demoler());

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cerrar();
        });
    }

    // ── Abrir / Cerrar ───────────────────────────────────────

    /**
     * Abre el modal mostrando la informacion del edificio.
     * Llamar desde juego.js cuando se hace click en celda building.
     * @param {Edificio} edificio
     */
    abrir(edificio) {
        this.#edificioActual = edificio;
        const info = edificio.getInfo();

        // Imagen
        this.#imgEdificio.src = info.imagen;
        this.#imgEdificio.alt = info.descripcion;

        // Nombre y descripcion
        this.#nombreEdificio.textContent      = this.#formatearTitulo(info.tipo, info.subtipo);
        this.#descripcionEdificio.textContent = info.descripcion;

        // Stats dinamicos segun tipo
        this.#statsEdificio.innerHTML = this.#generarStats(info, edificio);

        // Mostrar modal con animacion
        this.#overlay.classList.add('visible');
        this.#modal.classList.add('visible');
    }

    cerrar() {
        this.#modal.classList.remove('visible');
        this.#overlay.classList.remove('visible');
        this.#edificioActual = null;
    }

    // ── Demoler ──────────────────────────────────────────────

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
            residencial: { casa: 'Casa Simpson',         apartamento: 'Apartamento Springfield' },
            comercial:   { tienda: 'Kwik-E-Mart',        centroComercial: 'Springfield Mall' },
            industrial:  { fabrica: 'Planta Nuclear',    granja: 'Granja Springfield' },
            servicio:    { policia: 'Comisaria Wiggum',  bomberos: 'Bomberos Springfield', hospital: 'Hospital Springfield' },
            planta:      { electrica: 'Planta Electrica', agua: 'Planta de Agua' },
            parque:      { parque: 'Parque Springfield' },
        };
        return nombres[tipo]?.[subtipo] ?? `${tipo} — ${subtipo}`;
    }

    #generarStats(info, edificio) {
        const consumo    = edificio.calcularConsumo();
        const produccion = edificio.calcularProduccion();
        const filas      = [];

        // Costo y mantenimiento
        filas.push(`<div class="stat"><span>Costo construccion</span><span>$${info.costo.toLocaleString()}</span></div>`);
        filas.push(`<div class="stat"><span>Mantenimiento/turno</span><span>$${edificio.getCostoMantenimiento()}</span></div>`);

        // Consumo
        if (consumo.electricidad) filas.push(`<div class="stat consumo"><span>⚡ Consume electricidad</span><span>${consumo.electricidad}/turno</span></div>`);
        if (consumo.agua)         filas.push(`<div class="stat consumo"><span>💧 Consume agua</span><span>${consumo.agua}/turno</span></div>`);

        // Produccion
        if (produccion.money)       filas.push(`<div class="stat produccion"><span>💰 Genera dinero</span><span>$${produccion.money}/turno</span></div>`);
        if (produccion.electricity) filas.push(`<div class="stat produccion"><span>⚡ Produce electricidad</span><span>${produccion.electricity}/turno</span></div>`);
        if (produccion.water)       filas.push(`<div class="stat produccion"><span>💧 Produce agua</span><span>${produccion.water}/turno</span></div>`);
        if (produccion.food)        filas.push(`<div class="stat produccion"><span>🌽 Produce alimentos</span><span>${produccion.food}/turno</span></div>`);

        // Datos especificos por tipo
        if (info.capacidad !== undefined) {
            filas.push(`<div class="stat"><span>👥 Capacidad</span><span>${info.ocupantes}/${info.capacidad}</span></div>`);
        }
        if (info.empleos !== undefined) {
            filas.push(`<div class="stat"><span>💼 Empleos</span><span>${info.empleados}/${info.empleos}</span></div>`);
        }
        if (info.radio !== undefined) {
            filas.push(`<div class="stat"><span>📡 Radio de efecto</span><span>${info.radio} celdas</span></div>`);
        }
        if (info.beneficioFelicidad !== undefined) {
            filas.push(`<div class="stat"><span>😊 Beneficio felicidad</span><span>+${info.beneficioFelicidad}</span></div>`);
        }

        // Posicion
        filas.push(`<div class="stat"><span>📍 Posicion</span><span>(${info.posicion.x}, ${info.posicion.y})</span></div>`);

        return filas.join('');
    }
}