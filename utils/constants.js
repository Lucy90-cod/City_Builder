/**
 * constants.js
 * Constantes globales del juego. Fuente de verdad para valores fijos
 * que aparecen en varios modulos.
 */

// ── Codigos del grid ─────────────────────────────────────────────────────────
// Usados en Mapa.js, ControladorMapa.js y archivos .txt de mapas (HU-002)

export const CODIGO_CELDA = Object.freeze({
    GRASS:            'g',
    ROAD:             'r',
    CASA:             'R1',
    APARTAMENTO:      'R2',
    TIENDA:           'C1',
    CENTRO_COMERCIAL: 'C2',
    FABRICA:          'I1',
    GRANJA:           'I2',
    POLICIA:          'S1',
    BOMBEROS:         'S2',
    HOSPITAL:         'S3',
    PLANTA_ELECTRICA: 'U1',
    PLANTA_AGUA:      'U2',
    PARQUE:           'P1',
});

// Mapeo codigo → { tipo, subtipo } para cargar mapas desde .txt (HU-002)
// Equivalente al TIPO_MAP en ControladorMapa.js
export const CODIGO_A_EDIFICIO = Object.freeze({
    g:  null,
    r:  'road',
    R1: { tipo: 'residencial', subtipo: 'casa' },
    R2: { tipo: 'residencial', subtipo: 'apartamento' },
    C1: { tipo: 'comercial',   subtipo: 'tienda' },
    C2: { tipo: 'comercial',   subtipo: 'centroComercial' },
    I1: { tipo: 'industrial',  subtipo: 'fabrica' },
    I2: { tipo: 'industrial',  subtipo: 'granja' },
    S1: { tipo: 'servicio',    subtipo: 'policia' },
    S2: { tipo: 'servicio',    subtipo: 'bomberos' },
    S3: { tipo: 'servicio',    subtipo: 'hospital' },
    U1: { tipo: 'planta',      subtipo: 'electrica' },
    U2: { tipo: 'planta',      subtipo: 'agua' },
    P1: { tipo: 'parque',      subtipo: 'parque' },
});

// ── Tipos de edificio ────────────────────────────────────────────────────────

export const TIPO_EDIFICIO = Object.freeze({
    RESIDENCIAL: 'residencial',
    COMERCIAL:   'comercial',
    INDUSTRIAL:  'industrial',
    SERVICIO:    'servicio',
    PLANTA:      'planta',
    PARQUE:      'parque',
});

// ── Mapa ─────────────────────────────────────────────────────────────────────

export const MAPA = Object.freeze({
    MIN_ANCHO:    15,
    MIN_ALTO:     15,
    MAX_ANCHO:    30,
    MAX_ALTO:     30,
    VALOR_INICIAL: 'g',
});

// ── Recursos ─────────────────────────────────────────────────────────────────

export const RECURSOS = Object.freeze({
    DINERO_INICIAL:       50000,
    ELECTRICIDAD_INICIAL: 0,
    AGUA_INICIAL:         0,
    ALIMENTOS_INICIALES:  0,
    UMBRAL_GAME_OVER:     -10,   // electricidad o agua por debajo → game over
});

// ── Turnos ───────────────────────────────────────────────────────────────────

export const TURNOS = Object.freeze({
    DURACION_SEGUNDOS:             30,
    DURACION_MINIMA_SEGUNDOS:       5,
    GUARDADO_AUTOMATICO_SEGUNDOS:  30,
});

// ── Ciudadanos ───────────────────────────────────────────────────────────────

export const CIUDADANOS = Object.freeze({
    TASA_CRECIMIENTO_MIN:        1,
    TASA_CRECIMIENTO_MAX:        3,
    TASA_CRECIMIENTO_DEFAULT:    2,
    FELICIDAD_MINIMA_PARA_CRECER: 60,
    FELICIDAD_INICIAL:           50,
    FELICIDAD_MIN:                0,
    FELICIDAD_MAX:              100,
    CONSUMO_AGUA_POR_TURNO:       1,
    CONSUMO_ELECTRICIDAD_POR_TURNO: 1,
    CONSUMO_COMIDA_POR_TURNO:     1,
});

// ── Felicidad ────────────────────────────────────────────────────────────────

export const FELICIDAD = Object.freeze({
    BONUS_VIVIENDA:             20,
    BONUS_EMPLEO:               15,
    BONUS_POR_SERVICIO:         10,
    BONUS_POR_PARQUE:            5,
    PENALIZACION_SIN_VIVIENDA: -20,
    PENALIZACION_SIN_EMPLEO:   -15,
});

// ── Construccion ─────────────────────────────────────────────────────────────

export const CONSTRUCCION = Object.freeze({
    REEMBOLSO_DEMOLICION: 0.5,   // porcentaje del costo que se devuelve
    COSTO_VIA:            100,
});

// ── Puntuacion ───────────────────────────────────────────────────────────────

export const PUNTUACION = Object.freeze({
    POR_POBLACION:              10,
    POR_FELICIDAD_PROMEDIO:      5,
    POR_DINERO_CADA_100:         1,
    POR_EDIFICIO:               50,
    POR_ELECTRICIDAD_BALANCE:    2,
    POR_AGUA_BALANCE:            2,
    BONUS_TODOS_EMPLEADOS:     500,
    BONUS_FELICIDAD_SOBRE_80:  300,
    BONUS_RECURSOS_POSITIVOS:  200,
    BONUS_POBLACION_1000:     1000,
    PEN_DINERO_NEGATIVO:      -500,
    PEN_ELECTRICIDAD_NEGATIVA: -300,
    PEN_AGUA_NEGATIVA:         -300,
    PEN_FELICIDAD_BAJO_40:    -400,
    PEN_CIUDADANO_DESEMPLEADO:  -10,
});

// ── APIs externas ────────────────────────────────────────────────────────────

export const APIS = Object.freeze({
    ACTUALIZACION_CLIMA_MIN:    30,
    ACTUALIZACION_NOTICIAS_MIN: 30,
    MAX_NOTICIAS:                5,
});
