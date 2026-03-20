/**
 * MapaRenderer.js
 * Renderiza el grid del mapa en el DOM.
 * Conectado con ControladorRuta para mostrar rutas Dijkstra.
 */

const IMAGENES_EDIFICIO = {
    residencial: {
        casa: '/assets/edificios/casa_simpsons.png',
        apartamento: '/assets/edificios/apartamento_simpsons.png',
    },
    comercial: {
        tienda: '/assets/edificios/kwik_e_mart.png',
        centroComercial: '/assets/edificios/springfield_mall.png',
    },
    industrial: {
        fabrica: '/assets/edificios/planta_nuclear.png',
        granja: '/assets/edificios/granja_springfield.png',
    },
    servicio: {
        policia: '/assets/edificios/policia_springfield.png',
        bomberos: '/assets/edificios/bomberos_springfield.png',
        hospital: '/assets/edificios/hospital_springfield.png',
    },
    planta: {
        electrica: '/assets/edificios/planta_electrica.png',
        agua: '/assets/edificios/planta_agua.png',
    },
    parque: {
        parque: '/assets/edificios/parque_springfield.png',
    },
};

const PERSONAJES = [
    '/assets/personajes/bart.png',
    '/assets/personajes/lisa.png',
    '/assets/personajes/marge.png',
    '/assets/personajes/maggie.png',
    '/assets/personajes/homer_normal.png',
];

export class MapaRenderer {

    #contenedor;
    #mapa;
    #edificios;
    #onCeldaClick;
    #ctrlRuta;          // opcional — para mostrar rutas Dijkstra

    constructor(contenedor, mapa, edificios, onCeldaClick, ctrlRuta = null) {
        this.#contenedor = contenedor;
        this.#mapa = mapa;
        this.#edificios = edificios;
        this.#onCeldaClick = onCeldaClick;
        this.#ctrlRuta = ctrlRuta;
    }

    // ── Render inicial ───────────────────────────────────────

    renderizar() {
        const ancho = this.#mapa.getAncho();
        const alto = this.#mapa.getAlto();

        this.#contenedor.style.gridTemplateColumns =
            `repeat(${ancho}, var(--celda-size))`;
        this.#contenedor.innerHTML = '';

        for (let y = 0; y < alto; y++) {
            for (let x = 0; x < ancho; x++) {
                const celda = this.#mapa.getCelda(x, y);
                const el = this.#crearElemento(x, y, celda);
                this.#contenedor.appendChild(el);
            }
        }
    }

    // ── Actualizacion ────────────────────────────────────────

    actualizarCelda(x, y) {
        const celda = this.#mapa.getCelda(x, y);
        const el = this.#getEl(x, y);
        if (el) this.#aplicarEstado(el, x, y, celda);
    }

    actualizarTodo() {
        for (let y = 0; y < this.#mapa.getAlto(); y++) {
            for (let x = 0; x < this.#mapa.getAncho(); x++) {
                this.actualizarCelda(x, y);
            }
        }
    }

    // ── Ruta Dijkstra ────────────────────────────────────────

    /**
     * Calcula y muestra la ruta entre dos puntos.
     * @param {{x,y}} origen
     * @param {{x,y}} destino
     */
    async calcularYMostrarRuta(origen, destino) {
        if (!this.#ctrlRuta) return;

        this.limpiarRuta();
        const resultado = await this.#ctrlRuta.calcularRuta(origen, destino);

        if (!resultado.ok) {
            return { ok: false, mensaje: resultado.mensaje };
        }

        resultado.ruta.forEach(({ x, y }) => {
            const el = this.#getEl(x, y);
            if (el) el.classList.add('ruta');
        });

        return { ok: true, mensaje: resultado.mensaje };
    }

    mostrarRuta(ruta) {
        this.limpiarRuta();
        ruta.forEach(({ x, y }) => {
            const el = this.#getEl(x, y);
            if (el) el.classList.add('ruta');
        });
    }

    limpiarRuta() {
        this.#contenedor.querySelectorAll('.celda.ruta')
            .forEach(el => el.classList.remove('ruta'));
    }

    // ── Modos cursor ─────────────────────────────────────────

    setModoConstruccion(activo) {
        this.#contenedor.classList.toggle('modo-construccion', activo);
        this.#contenedor.classList.remove('modo-via');
    }

    setModoVia(activo) {
        this.#contenedor.classList.toggle('modo-via', activo);
        this.#contenedor.classList.remove('modo-construccion');
    }

    setModoNormal() {
        this.#contenedor.classList.remove('modo-construccion', 'modo-via');
    }

    // ── Privados ─────────────────────────────────────────────

    #crearElemento(x, y, celda) {
        const el = document.createElement('div');
        el.classList.add('celda');
        el.dataset.x = x;
        el.dataset.y = y;
        this.#aplicarEstado(el, x, y, celda);
        const callback = this.#onCeldaClick;
        el.addEventListener('click', () => callback(x, y, celda));
        return el;
    }

    #aplicarEstado(el, x, y, celda) {
        el.classList.remove('grass', 'road', 'building');
        el.style.backgroundImage = '';
        el.dataset.tipo = '';
        el.dataset.tooltip = '';

        // Quitar personaje anterior
        el.querySelector('.personaje-simpsons')?.remove();

        const tipo = celda.getTipo();
        el.classList.add(tipo);

        if (tipo === 'building') {
            const mapaEdificios = typeof this.#edificios === 'function'
                ? this.#edificios()
                : this.#edificios;
            const edificio = mapaEdificios.get(celda.getEdificioId());
            if (edificio) {
                const info = edificio.getInfo();
                const imagen = IMAGENES_EDIFICIO[info.tipo]?.[info.subtipo];
                if (imagen) el.style.backgroundImage = `url('${imagen}')`;
                el.dataset.tipo = info.tipo;
                el.dataset.tooltip = info.descripcion;
                if (info.tipo === 'residencial' && info.ocupantes > 0) {
                    this.#agregarPersonaje(el);
                }
            }
        } else if (tipo === 'grass') {
            el.dataset.tooltip = `(${x},${y})`;
        } else if (tipo === 'road') {
            el.dataset.tooltip = `Via (${x},${y})`;
        }
    }

    #agregarPersonaje(celdaEl) {
        const div = document.createElement('div');
        div.classList.add('personaje-simpsons');
        const rand = PERSONAJES[Math.floor(Math.random() * PERSONAJES.length)];
        div.style.backgroundImage = `url('${rand}')`;
        celdaEl.appendChild(div);
    }

    #getEl(x, y) {
        return this.#contenedor.querySelector(`.celda[data-x="${x}"][data-y="${y}"]`);
    }
}