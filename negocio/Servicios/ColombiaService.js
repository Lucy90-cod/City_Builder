/**
 * Consume api-colombia.com para poblar el selector de region
 * en el formulario de creacion de ciudad.
 *
 * Endpoints usados:
 *   GET https://api-colombia.com/api/v1/Department       → departamentos
 *   GET https://api-colombia.com/api/v1/Department/{id}/cities → municipios
 */

export class ColombiaService {

    static #BASE_URL = 'https://api-colombia.com/api/v1';

    /**
     * Obtiene la lista de departamentos de Colombia.
     * @returns {Promise<Array<{ id, nombre }>>}
     */
    static async getDepartamentos() {
        try {
            const response = await fetch(`${ColombiaService.#BASE_URL}/Department`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return data.map(dep => ({
                id:     dep.id,
                nombre: dep.name,
            })).sort((a, b) => a.nombre.localeCompare(b.nombre));

        } catch (error) {
            console.error('ColombiaService.getDepartamentos() fallo:', error.message);
            return ColombiaService.#departamentosFallback();
        }
    }

    /**
     * Obtiene los municipios de un departamento.
     * @param {number} departamentoId
     * @returns {Promise<Array<{ id, nombre }>>}
     */
    static async getMunicipios(departamentoId) {
        try {
            const response = await fetch(`${ColombiaService.#BASE_URL}/Department/${departamentoId}/cities`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return data.map(city => ({
                id:     city.id,
                nombre: city.name,
            })).sort((a, b) => a.nombre.localeCompare(b.nombre));

        } catch (error) {
            console.error('ColombiaService.getMunicipios() fallo:', error.message);
            return [];
        }
    }

    static #departamentosFallback() {
        return [
            { id: 1,  nombre: 'Antioquia' },
            { id: 2,  nombre: 'Atlantico' },
            { id: 3,  nombre: 'Bogota D.C.' },
            { id: 4,  nombre: 'Bolivar' },
            { id: 5,  nombre: 'Caldas' },
            { id: 6,  nombre: 'Cundinamarca' },
            { id: 7,  nombre: 'Nariño' },
            { id: 8,  nombre: 'Risaralda' },
            { id: 9,  nombre: 'Santander' },
            { id: 10, nombre: 'Valle del Cauca' },
        ];
    }
}