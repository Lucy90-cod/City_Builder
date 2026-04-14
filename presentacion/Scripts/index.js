/**
 * index.js
 * Maneja el formulario de creacion de nueva ciudad.
 * Valida, crea Ciudad + Jugador y redirige a juego.html
 */

import { ControladorCiudad } from '../../negocio/ControladorCiudad.js';
import { ControladorJugador } from '../../negocio/ControladorJugador.js';
import { ColombiaService }    from '../../negocio/servicios/ColombiaService.js';
import { ControladorMapa }    from '../../negocio/ControladorMapa.js';
import { ControladorEdificio } from '../../negocio/ControladorEdificio.js';
import { CiudadStorage }      from '../../acceso_datos/CiudadStorage.js';

// ── Instancias de controladores ──────────────────────────────
const ctrlCiudad = new ControladorCiudad();
const ctrlJugador = new ControladorJugador();

// ── Referencias al DOM ───────────────────────────────────────
const form = document.getElementById('form-nueva-ciudad');
const inputNombre = document.getElementById('nombre-ciudad');
const inputAlcalde = document.getElementById('nombre-alcalde');
const selectDepto = document.getElementById('select-departamento');
const selectMunicipio = document.getElementById('select-municipio');
const inputLatitud = document.getElementById('input-latitud');
const inputLongitud = document.getElementById('input-longitud');
const inputRegionTexto = document.getElementById('input-region-texto');
const selectTamano = document.getElementById('select-tamano');
const panelColombia = document.getElementById('panel-colombia');
const panelCoordenadas = document.getElementById('panel-coordenadas');
const radios = document.querySelectorAll('input[name="modo-region"]');
const imgLogo = document.getElementById('img-logo');
if (imgLogo) imgLogo.addEventListener('error', () => { imgLogo.style.display = 'none'; });
const inputArchivoMapa = document.getElementById('input-archivo-mapa');
const btnCargarMapa = document.getElementById('btn-cargar-mapa');
const nombreArchivo = document.getElementById('nombre-archivo-mapa');
const errorMapa = document.getElementById('error-mapa');
const previewMapa = document.getElementById('preview-mapa');
const inputArchivoJson = document.getElementById('input-archivo-ciudad-json');
const btnCargarJson = document.getElementById('btn-cargar-json');
const nombreArchivoJson = document.getElementById('nombre-archivo-json');

// Tabla de clases CSS por token — en lugar de style= inline
// Las clases deben estar definidas en Index.css
const CLASES_TOKEN = {
    g: 'celda-grass',
    r: 'celda-road',
    R1: 'celda-res1', R2: 'celda-res2',
    C1: 'celda-com1', C2: 'celda-com2',
    I1: 'celda-ind1', I2: 'celda-ind2',
    S1: 'celda-ser1', S2: 'celda-ser2', S3: 'celda-ser3',
    U1: 'celda-uti1', U2: 'celda-uti2',
    P1: 'celda-par1',
};

let mapaTexto = null;  // guarda el contenido del .txt
let datosCiudadJson = null; // aquí guardarás el objeto parseado, o null si no hay archivo válido

// Estado del formulario
let modoRegion = 'colombia';
let latitudFinal = null;
let longitudFinal = null;
let regionFinal = '';

// ── Inicializacion ───────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    cargarDepartamentos();
    registrarEventos();
    verificarPartidaGuardada();
});

// ── Continuar partida guardada ───────────────────────────────

function verificarPartidaGuardada() {
    const data = CiudadStorage.load();
    if (!data) return;

    const banner = document.getElementById('banner-continuar');
    if (!banner) return;

    const nombreEl = document.getElementById('banner-ciudad-nombre');
    if (nombreEl) nombreEl.textContent = data.nombre ?? 'tu ciudad';

    banner.classList.remove('oculto');

    document.getElementById('btn-continuar-partida')?.addEventListener('click', () => {
        window.location.href = 'presentacion/vistas/juego.html';
    });

    document.getElementById('btn-eliminar-guardado')?.addEventListener('click', () => {
        if (confirm('¿Seguro? Se perderá la partida guardada.')) {
            CiudadStorage.delete();
            banner.classList.add('oculto');
        }
    });
}

// ── Cargar departamentos ─────────────────────────────────────

async function cargarDepartamentos() {
    try {
        const deptos = await ColombiaService.getDepartamentos();
        selectDepto.innerHTML = '<option value="">Selecciona departamento</option>';
        deptos.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.nombre;
            selectDepto.appendChild(opt);
        });
    } catch (e) {
        selectDepto.innerHTML = '<option value="">Error cargando departamentos</option>';
    }
}

// ── Eventos ──────────────────────────────────────────────────

function registrarEventos() {

    // Cambio de modo region
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            modoRegion = radio.value;
            if (modoRegion === 'colombia') {
                panelColombia.classList.remove('oculto');
                panelCoordenadas.classList.add('oculto');
            } else {
                panelColombia.classList.add('oculto');
                panelCoordenadas.classList.remove('oculto');
            }
        });
    });

    // Cambio de departamento → cargar municipios
    selectDepto.addEventListener('change', async () => {
        const deptoId = selectDepto.value;
        if (!deptoId) {
            selectMunicipio.innerHTML = '<option value="">Selecciona depto primero</option>';
            selectMunicipio.disabled = true;
            return;
        }
        try {
            selectMunicipio.innerHTML = '<option value="">Cargando...</option>';
            selectMunicipio.disabled = true;
            const municipios = await ColombiaService.getMunicipios(deptoId);
            selectMunicipio.innerHTML = '<option value="">Selecciona municipio</option>';
            municipios.forEach(m => {
                const opt = document.createElement('option');
                opt.value = JSON.stringify({ nombre: m.nombre, lat: m.latitud ?? 0, lon: m.longitud ?? 0 });
                opt.textContent = m.nombre;
                selectMunicipio.appendChild(opt);
            });
            selectMunicipio.disabled = false;
        } catch (e) {
            selectMunicipio.innerHTML = '<option value="">Error cargando municipios</option>';
        }
    });

    // Cambio de municipio → asignar coordenadas
    selectMunicipio.addEventListener('change', () => {
        if (!selectMunicipio.value) return;
        try {
            const data = JSON.parse(selectMunicipio.value);
            latitudFinal = data.lat;
            longitudFinal = data.lon;
            regionFinal = data.nombre;
        } catch (e) {
            latitudFinal = 0; longitudFinal = 0;
        }
    });

    // Abrir selector de archivo al hacer click en el boton
    btnCargarMapa.addEventListener('click', () => inputArchivoMapa.click());

    // Cuando selecciona un archivo
    inputArchivoMapa.addEventListener('change', () => {
        const archivo = inputArchivoMapa.files[0];
        if (!archivo) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const texto = e.target.result;
            const error = validarFormatoMapa(texto);

            if (error) {
                errorMapa.textContent = error;
                mapaTexto = null;
                nombreArchivo.textContent = 'Archivo invalido';
                previewMapa.classList.add('oculto');
                return;
            }

            mapaTexto = texto;
            datosCiudadJson = null;
            nombreArchivoJson.textContent = 'Ningún archivo .json';
            errorMapa.textContent = '';
            nombreArchivo.textContent = archivo.name;
            mostrarPreviewMapa(texto);
        };
        reader.readAsText(archivo);
    });

    // Cargar ciudad desde JSON (export de Ciudad.toJSON)
    btnCargarJson?.addEventListener('click', () => inputArchivoJson?.click());

    inputArchivoJson?.addEventListener('change', () => {
        const archivo = inputArchivoJson.files[0];
        if (!archivo) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const texto = e.target.result;
                const data = JSON.parse(texto);

                if (!data || typeof data !== 'object')
                    throw new Error('El archivo no contiene un objeto JSON válido.');

                if (!data.nombre && !data.mapa)
                    throw new Error('No parece un guardado de ciudad reconocible.');

                datosCiudadJson = data;
                nombreArchivoJson.textContent = archivo.name;
                errorMapa.textContent = '';

                mapaTexto = null;
                nombreArchivo.textContent = 'Ningún archivo seleccionado';
                previewMapa?.classList.add('oculto');

            } catch (err) {
                datosCiudadJson = null;
                nombreArchivoJson.textContent = 'Archivo inválido';
                errorMapa.textContent = err.message || 'JSON inválido';
            }
        };
        reader.onerror = () => {
            datosCiudadJson = null;
            nombreArchivoJson.textContent = 'Error al leer el archivo';
        };
        reader.readAsText(archivo, 'UTF-8');
    });

    form.addEventListener('submit', manejarSubmit);
}

// ── Submit ───────────────────────────────────────────────────

function manejarSubmit(e) {
    e.preventDefault();
    limpiarErrores();

    if (datosCiudadJson) {
        try {
            const ciudad = ctrlCiudad.importarDesdeJSON(datosCiudadJson);
            if (!ciudad) {
                mostrarErrorFormulario('No se pudo importar el JSON.');
                return;
            }

            ctrlJugador.crearJugador(ciudad.getNombreAlcalde());
            ctrlCiudad.guardar();
            window.location.href = 'presentacion/vistas/juego.html';
            return;
        } catch (err) {
            mostrarErrorFormulario(err.message || 'Error al importar la ciudad.');
            return;
        }
    }

    if (modoRegion === 'coordenadas') {
        latitudFinal = parseFloat(inputLatitud.value);
        longitudFinal = parseFloat(inputLongitud.value);
        regionFinal = inputRegionTexto.value.trim() || 'Region personalizada';
    }

    const tamano = parseInt(selectTamano.value);

    const datos = {
        nombre: inputNombre.value.trim(),
        alcalde: inputAlcalde.value.trim(),
        region: regionFinal,
        latitud: latitudFinal ?? 0,
        longitud: longitudFinal ?? 0,
        ancho: tamano,
        alto: tamano,
    };

    try {
        const ciudad = ctrlCiudad.crearCiudad(datos);
        ctrlJugador.crearJugador(datos.alcalde);

        if (mapaTexto) {
            const ctrlMapa = new ControladorMapa(ciudad);
            const ctrlEdificio = new ControladorEdificio(ciudad);
            ctrlMapa.cargarDesdeTexto(mapaTexto, ctrlEdificio);

            const recurso = ciudad.getRecurso();
            const produccionTotal = { money: 0, electricity: 0, water: 0, food: 0 };

            ciudad.getEdificios().forEach(edificio => {
                const p = edificio.calcularProduccion();
                produccionTotal.money += p.money ?? 0;
                produccionTotal.electricity += p.electricity ?? 0;
                produccionTotal.water += p.water ?? 0;
                produccionTotal.food += p.food ?? 0;
            });

            recurso.updateBalance(produccionTotal, {});
        }

        ctrlCiudad.guardar();
        window.location.href = 'presentacion/vistas/juego.html';

    } catch (error) {
        mostrarErrorFormulario(error.message);
    }
}

// ── Helpers UI ───────────────────────────────────────────────

function limpiarErrores() {
    document.querySelectorAll('.campo-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.campo-input').forEach(el => el.classList.remove('error'));
}

function mostrarErrorFormulario(mensaje) {
    const btn = document.getElementById('btn-crear-ciudad');
    let errorGeneral = document.getElementById('error-general');
    if (!errorGeneral) {
        errorGeneral = document.createElement('p');
        errorGeneral.id = 'error-general';
        errorGeneral.className = 'campo-error';
        btn.insertAdjacentElement('afterend', errorGeneral);
    }
    errorGeneral.textContent = mensaje;
}

function validarFormatoMapa(texto) {
    const filas = texto.trim().split('\n');
    if (filas.length < 15)
        return `El mapa debe tener al menos 15 filas. Tiene ${filas.length}.`;

    const tokensValidos = /^(g|r|R1|R2|C1|C2|I1|I2|S1|S2|S3|U1|U2|P1)$/;
    for (let i = 0; i < filas.length; i++) {
        const tokens = filas[i].trim().split(/\s+/);
        if (tokens.length < 15)
            return `Fila ${i + 1} tiene solo ${tokens.length} columnas. Minimo 15.`;
        for (const token of tokens) {
            if (!tokensValidos.test(token))
                return `Token invalido "${token}" en fila ${i + 1}. Tokens validos: g r R1 R2 C1 C2 I1 I2 S1 S2 S3 U1 U2 P1`;
        }
    }
    return null;
}

// ── Preview del mapa ─────────────────────────────────────────
//
function mostrarPreviewMapa(texto) {
    const filas = texto.trim().split('\n');
    const tamano = parseInt(selectTamano.value);

    previewMapa.innerHTML = '';
    previewMapa.classList.remove('oculto');

    // Variable CSS para el tamaño de celda — esto NO es style= sobre un elemento
    // es setProperty sobre la variable que usa el CSS del grid
    const celdaPx = Math.max(6, Math.floor(280 / tamano));
    previewMapa.style.setProperty('--celda-size', `${celdaPx}px`);
    previewMapa.setAttribute('data-cols', tamano);
    previewMapa.style.gridTemplateColumns = `repeat(${tamano}, var(--celda-size, 10px))`;

    filas.slice(0, tamano).forEach(fila => {
        fila.trim().split(/\s+/).slice(0, tamano).forEach(token => {
            const div = document.createElement('div');
            div.className = `celda-preview ${CLASES_TOKEN[token] ?? 'celda-grass'}`;
            div.title = token;
            previewMapa.appendChild(div);
        });
    });
}