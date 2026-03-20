/**
 * ControladorCiudad.js
 * Gestiona la creacion, guardado y carga de la ciudad.
 */

import { Ciudad }        from '../modelos/Ciudad.js';
import { Recurso }       from '../modelos/Recurso.js';
import { Puntuacion }    from '../modelos/Puntuacion.js';
import { Residencial }   from '../modelos/Residencial.js';
import { Comercial }     from '../modelos/Comercial.js';
import { Industrial }    from '../modelos/Industrial.js';
import { Servicio }      from '../modelos/Servicio.js';
import { Planta }        from '../modelos/Planta.js';
import { Parque }        from '../modelos/Parque.js';
import { CiudadStorage } from '../acceso_datos/CiudadStorage.js';

export class ControladorCiudad {

    #ciudad;

    constructor() {
        this.#ciudad = null;
    }

    crearCiudad(datosFormulario) {
        this.validarDatos(datosFormulario);

        this.#ciudad = new Ciudad({
            nombre:        datosFormulario.nombre,
            nombreAlcalde: datosFormulario.nombreAlcalde ?? datosFormulario.alcalde,
            region:        datosFormulario.region,
            coordenadas: {
                lat: Number(datosFormulario.latitud  ?? datosFormulario.coordenadas?.lat ?? 0),
                lon: Number(datosFormulario.longitud ?? datosFormulario.coordenadas?.lon ?? 0),
            },
            ancho: Number(datosFormulario.ancho ?? 15),
            alto:  Number(datosFormulario.alto  ?? 15),
        });

        // Recursos iniciales con electricidad y agua para sobrevivir primeros turnos
        this.#ciudad.setRecurso(new Recurso(50000, 100, 100, 0));
        this.#ciudad.setPuntuacion(new Puntuacion());

        CiudadStorage.save(this.#ciudad);
        return this.#ciudad;
    }

    validarDatos(datos) {
        if (!datos.nombre?.trim())
            throw new Error('El nombre de la ciudad es obligatorio');

        const alcalde = datos.nombreAlcalde ?? datos.alcalde;
        if (!alcalde?.trim())
            throw new Error('El nombre del alcalde es obligatorio');

        if (!datos.region?.trim())
            throw new Error('La region es obligatoria');

        if (datos.nombre.trim().length > 50)
            throw new Error('El nombre no puede superar 50 caracteres');

        const ancho = Number(datos.ancho ?? 15);
        const alto  = Number(datos.alto  ?? 15);
        if (ancho < 15 || ancho > 30 || alto < 15 || alto > 30)
            throw new Error('El tamano del mapa debe estar entre 15 y 30');

        const lat = Number(datos.latitud ?? datos.coordenadas?.lat ?? 0);
        const lon = Number(datos.longitud ?? datos.coordenadas?.lon ?? 0);
        if (isNaN(lat) || lat < -90  || lat > 90)
            throw new Error('La latitud debe estar entre -90 y 90');
        if (isNaN(lon) || lon < -180 || lon > 180)
            throw new Error('La longitud debe estar entre -180 y 180');
    }

    guardar() {
        if (this.#ciudad) CiudadStorage.save(this.#ciudad);
    }

    /**
     * Carga la ciudad desde LocalStorage y reconstruye
     * todas las instancias: Recurso, Puntuacion y Edificios.
     */
    cargar() {
        const data = CiudadStorage.load();
        if (!data) return null;

        this.#ciudad = Ciudad.fromJSON(data);

        // Reconstruir Recurso
        if (this.#ciudad._recursoData) {
            this.#ciudad.setRecurso(Recurso.fromJSON(this.#ciudad._recursoData));
        } else {
            this.#ciudad.setRecurso(new Recurso(50000, 100, 100, 0));
        }

        // Reconstruir Puntuacion
        if (this.#ciudad._puntuacionData) {
            this.#ciudad.setPuntuacion(Puntuacion.fromJSON(this.#ciudad._puntuacionData));
        } else {
            this.#ciudad.setPuntuacion(new Puntuacion());
        }

        // Reconstruir Edificios
        if (this.#ciudad._edificiosData?.length > 0) {
            this.#ciudad._edificiosData.forEach(eData => {
                const edificio = this.#reconstruirEdificio(eData);
                if (edificio) this.#ciudad.agregarEdificio(edificio);
            });
        }

        return this.#ciudad;
    }

    /**
     * Reconstruye una instancia de edificio desde datos JSON.
     */
    #reconstruirEdificio(data) {
        try {
            switch (data.tipo) {
                case 'residencial': return new Residencial(data.id, data.subtipo, data.posicion);
                case 'comercial':   return new Comercial(data.id, data.subtipo, data.posicion);
                case 'industrial':  return new Industrial(data.id, data.subtipo, data.posicion);
                case 'servicio':    return new Servicio(data.id, data.subtipo, data.posicion);
                case 'planta':      return new Planta(data.id, data.subtipo, data.posicion);
                case 'parque':      return new Parque(data.id, data.posicion);
                default:
                    console.warn(`Tipo de edificio desconocido: ${data.tipo}`);
                    return null;
            }
        } catch(e) {
            console.error('Error reconstruyendo edificio:', e.message);
            return null;
        }
    }

    hayPartidaGuardada()  { return CiudadStorage.hayPartida(); }
    eliminarPartida()     { CiudadStorage.delete(); }
    getCiudadActual()     { return this.#ciudad; }

    exportarJSON() {
        if (!this.#ciudad) return;
        const json = JSON.stringify(this.#ciudad.toJSON(), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `${this.#ciudad.getNombre()}_turno${this.#ciudad.getTurnoActual()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}