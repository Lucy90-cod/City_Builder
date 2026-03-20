import { Ciudadano } from './Ciudadano.js';
import { Ranking }   from './Ranking.js';

const OK   = '\x1b[32m✔\x1b[0m';
const FAIL = '\x1b[31m✘\x1b[0m';
const HEAD = '\x1b[1m\x1b[34m';

function test(desc, fn) {
    try { fn(); console.log(`${OK}  ${desc}`); }
    catch(e) { console.log(`${FAIL}  ${desc}\n     ${e.message}`); }
}

// ════════════════════════════════════════
console.log(`\n${HEAD}══ PRUEBA: Ciudadano ══\x1b[0m`);
// ════════════════════════════════════════

test('new Ciudadano() felicidad inicial 50', () => {
    const c = new Ciudadano('c1');
    console.assert(c.getId()        === 'c1',  'id falla');
    console.assert(c.getFelicidad() === 50,    'felicidad inicial falla');
    console.assert(c.tieneVivienda() === false, 'vivienda falla');
    console.assert(c.tieneEmpleo()   === false, 'empleo falla');
});

test('asignarVivienda y asignarEmpleo funcionan', () => {
    const c = new Ciudadano('c2');
    c.asignarVivienda('r1');
    c.asignarEmpleo('com1');
    console.assert(c.tieneVivienda()            === true,  'vivienda falla');
    console.assert(c.tieneEmpleo()              === true,  'empleo falla');
    console.assert(c.getEdificioResidencialId() === 'r1',  'id residencial falla');
    console.assert(c.getEdificioTrabajoId()     === 'com1','id trabajo falla');
});

test('quedarSinVivienda y quedarSinEmpleo funcionan', () => {
    const c = new Ciudadano('c3');
    c.asignarVivienda('r1');
    c.asignarEmpleo('com1');
    c.quedarSinVivienda();
    c.quedarSinEmpleo();
    console.assert(c.tieneVivienda() === false, 'debe quedar sin vivienda');
    console.assert(c.tieneEmpleo()   === false, 'debe quedar sin empleo');
    console.assert(c.getEdificioResidencialId() === null, 'id debe ser null');
});

test('calcularFelicidad con vivienda y empleo = 35', () => {
    const c = new Ciudadano('c4');
    c.asignarVivienda('r1');
    c.asignarEmpleo('com1');
    c.calcularFelicidad({});
    console.assert(c.getFelicidad() === 35, `felicidad debe ser 35, es ${c.getFelicidad()}`);
});

test('calcularFelicidad con servicios y parques', () => {
    const c = new Ciudadano('c5');
    c.asignarVivienda('r1');
    c.asignarEmpleo('com1');
    c.calcularFelicidad({ serviciosCercanos: 1, parquesCercanos: 2 });
    // 20+15+10+(2*5) = 55
    console.assert(c.getFelicidad() === 55, `felicidad debe ser 55, es ${c.getFelicidad()}`);
});

test('calcularFelicidad sin vivienda ni empleo = 0 (clamp)', () => {
    const c = new Ciudadano('c6');
    c.calcularFelicidad({});
    // -20-15 = -35 → clamp a 0
    console.assert(c.getFelicidad() === 0, `felicidad debe ser 0, es ${c.getFelicidad()}`);
});

test('calcularFelicidad no supera 100', () => {
    const c = new Ciudadano('c7');
    c.asignarVivienda('r1');
    c.asignarEmpleo('com1');
    c.calcularFelicidad({ serviciosCercanos: 10, parquesCercanos: 10 });
    console.assert(c.getFelicidad() === 100, `felicidad debe ser 100, es ${c.getFelicidad()}`);
});

test('toJSON y fromJSON reconstruyen el ciudadano', () => {
    const c = new Ciudadano('c8');
    c.asignarVivienda('r1');
    c.asignarEmpleo('com1');
    c.calcularFelicidad({ serviciosCercanos: 1 });
    const c2 = Ciudadano.fromJSON(c.toJSON());
    console.assert(c2.getId()        === 'c8',  'id falla');
    console.assert(c2.tieneVivienda() === true,  'vivienda falla');
    console.assert(c2.tieneEmpleo()   === true,  'empleo falla');
    console.assert(c2.getFelicidad()  === c.getFelicidad(), 'felicidad falla');
});

// ════════════════════════════════════════
console.log(`\n${HEAD}══ PRUEBA: Ranking ══\x1b[0m`);
// ════════════════════════════════════════

// Mock de Ciudad para el ranking
const mockCiudad = (nombre, alcalde, score, turno = 5) => ({
    getNombre:        () => nombre,
    getNombreAlcalde: () => alcalde,
    getEstado: () => ({ nombre, nombreAlcalde: alcalde, score, turnoActual: turno }),
});

test('new Ranking() empieza vacio', () => {
    const r = new Ranking();
    console.assert(r.getTop10().length === 0, 'debe estar vacio');
    console.assert(r.getMaxEntradas()  === 10, 'max debe ser 10');
});

test('agregarEntrada agrega y ordena por score', () => {
    const r = new Ranking();
    r.agregarEntrada(mockCiudad('Springfield', 'Homer', 500));
    r.agregarEntrada(mockCiudad('Shelbyville', 'Ned',   800));
    r.agregarEntrada(mockCiudad('Capital',     'Burns', 300));
    const top = r.getTop10();
    console.assert(top[0].score === 800, 'primero debe ser 800');
    console.assert(top[1].score === 500, 'segundo debe ser 500');
    console.assert(top[2].score === 300, 'tercero debe ser 300');
});

test('getPosicion retorna posicion correcta', () => {
    const r = new Ranking();
    r.agregarEntrada(mockCiudad('Springfield', 'Homer', 500));
    r.agregarEntrada(mockCiudad('Shelbyville', 'Ned',   800));
    const pos = r.getPosicion('Springfield_Homer');
    console.assert(pos === 2, `posicion debe ser 2, es ${pos}`);
});

test('getPosicion retorna -1 si no esta', () => {
    const r = new Ranking();
    console.assert(r.getPosicion('NoExiste_Nadie') === -1, 'debe ser -1');
});

test('actualiza score si el nuevo es mayor', () => {
    const r = new Ranking();
    r.agregarEntrada(mockCiudad('Springfield', 'Homer', 500));
    r.agregarEntrada(mockCiudad('Springfield', 'Homer', 900));
    console.assert(r.getTop10().length    === 1,   'no debe duplicar');
    console.assert(r.getTop10()[0].score  === 900, 'score debe actualizarse');
});

test('no actualiza si el nuevo score es menor', () => {
    const r = new Ranking();
    r.agregarEntrada(mockCiudad('Springfield', 'Homer', 900));
    r.agregarEntrada(mockCiudad('Springfield', 'Homer', 300));
    console.assert(r.getTop10()[0].score === 900, 'score no debe bajar');
});

test('mantiene maximo 10 entradas', () => {
    const r = new Ranking();
    for (let i = 1; i <= 15; i++) {
        r.agregarEntrada(mockCiudad(`Ciudad${i}`, `Alcalde${i}`, i * 100));
    }
    console.assert(r.getTop10().length === 10, 'debe tener max 10');
    console.assert(r.getTop10()[0].score === 1500, 'primero debe ser el mayor');
});

test('limpiar vacia el ranking', () => {
    const r = new Ranking();
    r.agregarEntrada(mockCiudad('Springfield', 'Homer', 500));
    r.limpiar();
    console.assert(r.getTop10().length === 0, 'debe estar vacio');
});

test('toJSON y fromJSON reconstruyen el ranking', () => {
    const r = new Ranking();
    r.agregarEntrada(mockCiudad('Springfield', 'Homer', 500));
    r.agregarEntrada(mockCiudad('Shelbyville', 'Ned',   800));
    const r2 = Ranking.fromJSON(r.toJSON());
    console.assert(r2.getTop10().length   === 2,   'entradas falla');
    console.assert(r2.getTop10()[0].score === 800, 'orden falla');
});

console.log('\n');