// Grid bidimensional de NxM celdas (min 15x15, max 30x30).
// Coordenadas: (0,0) en esquina superior izquierda.
// Internamente guarda los edificios en un Map<id, {x,y}>para poder ubicarlos sin recorrer toda la matriz.

import { Celda } from './Celda.js';
import { Vias  } from './Vias.js';

// Tabla de conversion de codigos .txt → tipo de edificio Usada al cargar mapa desde archivo de texto (HU-002)
const CODIGOS_EDIFICIO = {
    R1: { tipo: 'residencial', subtipo: 'casa'            },
    R2: { tipo: 'residencial', subtipo: 'apartamento'     },
    C1: { tipo: 'comercial',   subtipo: 'tienda'          },
    C2: { tipo: 'comercial',   subtipo: 'centroComercial' },
    I1: { tipo: 'industrial',  subtipo: 'fabrica'         },
    I2: { tipo: 'industrial',  subtipo: 'granja'          },
    S1: { tipo: 'servicio',    subtipo: 'policia'         },
    S2: { tipo: 'servicio',    subtipo: 'bomberos'        },
    S3: { tipo: 'servicio',    subtipo: 'hospital'        },
    U1: { tipo: 'planta',      subtipo: 'electrica'       },
    U2: { tipo: 'planta',      subtipo: 'agua'            },
    P1: { tipo: 'parque',      subtipo: null              },
};

export class Mapa {

    #ancho;             // Number — columnas
    #alto;              // Number — filas
    #celdas;            // Celda[][] — matriz [y][x]
    #edificios;         // Map<edificioId, {x, y}> — indice de posicion
    #vias;              // Vias — red de caminos

    constructor(ancho, alto) {
        if (ancho < 15 || ancho > 30 || alto < 15 || alto > 30) {
            throw new Error(`Tamaño de mapa invalido: ${ancho}x${alto}. Rango permitido: 15-30.`);
        }

        this.#ancho     = ancho;
        this.#alto      = alto;
        this.#edificios = new Map();
        this.#vias      = new Vias();

        // Inicializar toda la matriz con celdas de tipo 'grass'
        this.#celdas = Array.from({ length: alto }, (_, y) =>
            Array.from({ length: ancho }, (_, x) => new Celda(x, y))
        );
    }

    // ── Getters basicos ──────────────────────────────────────────────────────

    getAncho()  { return this.#ancho; }
    getAlto()   { return this.#alto;  }
    getVias()   { return this.#vias;  }

    // ── Acceso a celdas ──────────────────────────────────────────────────────

    getCelda(x, y) {
        if (!this.#dentroDeLimites(x, y)) {
            throw new Error(`Coordenada (${x}, ${y}) fuera del mapa ${this.#ancho}x${this.#alto}`);
        }
        return this.#celdas[y][x];
    }

    setCelda(x, y, celda) {
        if (!this.#dentroDeLimites(x, y)) {
            throw new Error(`Coordenada (${x}, ${y}) fuera del mapa`);
        }
        this.#celdas[y][x] = celda;
    }

    // ── Consultas de estado ──────────────────────────────────────────────────

    estaOcupada(x, y) {
        return !this.getCelda(x, y).isEmpty();
    }

    // Revisa las 4 celdas adyacentes (arriba, abajo, izquierda, derecha)
    // y retorna true si alguna es de tipo 'road'
    tieneViaAdyacente(x, y) {
        const adyacentes = [
            { x: x,     y: y - 1 },   // arriba
            { x: x,     y: y + 1 },   // abajo
            { x: x - 1, y: y     },   // izquierda
            { x: x + 1, y: y     },   // derecha
        ];

        return adyacentes.some(({ x: ax, y: ay }) => {
            if (!this.#dentroDeLimites(ax, ay)) return false;
            return this.#celdas[ay][ax].isVia();
        });
    }

    // ── Operaciones sobre edificios ──────────────────────────────────────────

    colocarEdificio(edificioId, x, y) {
        const celda = this.getCelda(x, y);

        if (!celda.isEmpty()) {
            throw new Error(`La celda (${x}, ${y}) ya esta ocupada`);
        }
        if (!this.tieneViaAdyacente(x, y)) {
            throw new Error(`La celda (${x}, ${y}) no tiene una via adyacente`);
        }

        celda.ocuparConEdificio(edificioId);
        this.#edificios.set(edificioId, { x, y });
    }

    quitarEdificio(edificioId) {
        const pos = this.#edificios.get(edificioId);
        if (!pos) {
            throw new Error(`Edificio ${edificioId} no existe en el mapa`);
        }

        this.getCelda(pos.x, pos.y).vaciar();
        this.#edificios.delete(edificioId);
    }

    getPosicionEdificio(edificioId) {
        return this.#edificios.get(edificioId) ?? null;
    }

    // ── Operaciones sobre vias ───────────────────────────────────────────────

    colocarVia(x, y) {
        const celda = this.getCelda(x, y);

        if (!celda.isEmpty()) {
            throw new Error(`La celda (${x}, ${y}) ya esta ocupada`);
        }

        celda.ocuparConVia();
        this.#vias.agregarCelda(x, y);
    }

    eliminarVia(x, y) {
        const celda = this.getCelda(x, y);

        if (!celda.isVia()) {
            throw new Error(`La celda (${x}, ${y}) no es una via`);
        }

        celda.vaciar();
        this.#vias.eliminarCelda(x, y);
    }

    // ── Matriz para Dijkstra ─────────────────────────────────────────────────
    // Retorna una matriz de numeros:
    //   0 → celda no transitable (edificio o terreno vacio)
    //   1 → via (transitable)
    // Esta matriz se envia al backend POST /api/calculate-route

    getMatrizRuta() {
        return Array.from({ length: this.#alto }, (_, y) =>
            Array.from({ length: this.#ancho }, (_, x) =>
                this.#celdas[y][x].isVia() ? 1 : 0
            )
        );
    }

    // ── Carga desde archivo de texto (HU-002) ────────────────────────────────
    // Formato esperado: filas separadas por \n, celdas separadas por espacios
    // Ejemplo:
    //   g  g  r  g  g
    //   g R1  r C1  g
    //   g  g  r  g  g
    //
    // Retorna un array de { codigo, x, y } para que el ControladorEdificio
    // pueda instanciar los edificios reales (Mapa no importa las subclases)

    cargarDesdeTexto(texto) {
        const filas = texto.trim().split('\n');

        if (filas.length !== this.#alto) {
            throw new Error(
                `El archivo tiene ${filas.length} filas pero el mapa es de alto ${this.#alto}`
            );
        }

        const edificiosPendientes = [];   // [{ codigo, x, y }]

        filas.forEach((fila, y) => {
            const celdas = fila.trim().split(/\s+/);

            if (celdas.length !== this.#ancho) {
                throw new Error(
                    `Fila ${y} tiene ${celdas.length} celdas pero el mapa es de ancho ${this.#ancho}`
                );
            }

            celdas.forEach((codigo, x) => {
                const celda = this.#celdas[y][x];

                if (codigo === 'g') {
                    // terreno vacio — ya viene inicializado como 'grass'
                    return;
                }

                if (codigo === 'r') {
                    celda.ocuparConVia();
                    this.#vias.agregarCelda(x, y);
                    return;
                }

                if (CODIGOS_EDIFICIO[codigo]) {
                    // El mapa solo marca la celda; el controlador crea la instancia
                    celda.setTipo('building');
                    edificiosPendientes.push({ codigo, x, y, ...CODIGOS_EDIFICIO[codigo] });
                    return;
                }

                throw new Error(`Codigo desconocido en (${x}, ${y}): "${codigo}"`);
            });
        });

        return edificiosPendientes;
    }

    // ── Serializacion ────────────────────────────────────────────────────────

    toJSON() {
        return {
            ancho:     this.#ancho,
            alto:      this.#alto,
            celdas:    this.#celdas.map(fila => fila.map(c => c.toJSON())),
            edificios: [...this.#edificios.entries()].map(([id, pos]) => ({ id, ...pos })),
            vias:      this.#vias.toJSON(),
        };
    }

    // Reconstruye desde JSON (para cargar desde LocalStorage)
    static fromJSON(data) {
        const mapa = new Mapa(data.ancho, data.alto);

        // Restaurar celdas
        data.celdas.forEach(fila =>
            fila.forEach(cData => {
                mapa.#celdas[cData.y][cData.x] = Celda.fromJSON(cData);
            })
        );

        // Restaurar indice de edificios
        data.edificios.forEach(({ id, x, y }) => {
            mapa.#edificios.set(id, { x, y });
        });

        // Restaurar vias
        mapa.#vias = Vias.fromJSON(data.vias);

        return mapa;
    }

    // ── Privados ─────────────────────────────────────────────────────────────

    #dentroDeLimites(x, y) {
        return x >= 0 && x < this.#ancho && y >= 0 && y < this.#alto;
    }
}