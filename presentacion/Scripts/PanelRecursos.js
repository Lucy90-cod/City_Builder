/**
 * panelRecursos.js
 * Actualiza los valores de recursos en el DOM cada turno.
 * Se llama desde juego.js despues de cada turno completado.
 */

export class PanelRecursos {

    /**
     * Actualiza todos los indicadores de recursos en el header y sidebar.
     * @param {Ciudad} ciudad
     */
    static actualizar(ciudad) {
        const recurso = ciudad.getRecurso();
        if (!recurso) return;

        const estado = ciudad.getEstado();

        // ── Header ───────────────────────────────────────
        PanelRecursos.#setValor('val-dinero',      `$${recurso.getMoney().toLocaleString('es-CO')}`);
        PanelRecursos.#colorearDinero('val-dinero', recurso.getMoney());
        PanelRecursos.#setValor('val-electricidad', recurso.getElectricity().toLocaleString());
        PanelRecursos.#setValor('val-agua',         recurso.getWater().toLocaleString());
        PanelRecursos.#setValor('val-poblacion',    estado.poblacion);
        PanelRecursos.#setValor('val-score',        estado.score.toLocaleString());
        PanelRecursos.#setValor('turno-actual',     `Turno ${ciudad.getTurnoActual()}`);
        PanelRecursos.#setValor('nombre-ciudad',    ciudad.getNombre());

        // Colorear si recursos bajos o negativos
        PanelRecursos.#colorearRecurso('recurso-elec',  recurso.getElectricity());
        PanelRecursos.#colorearRecurso('recurso-agua',  recurso.getWater());
        PanelRecursos.#colorearDinero('recurso-dinero', recurso.getMoney());

        // ── Sidebar derecha — detalle ─────────────────────
        const contenedor = document.getElementById('recursos-detalle');
        if (contenedor) {
            contenedor.innerHTML = `
                <div class="recurso-detalle-item">
                    <span class="recurso-detalle-nombre">💰 Dinero</span>
                    <span class="recurso-detalle-valor ${recurso.getMoney() < 0 ? 'negativo' : ''}">
                        $${recurso.getMoney().toLocaleString('es-CO')}
                    </span>
                </div>
                <div class="recurso-detalle-item">
                    <span class="recurso-detalle-nombre">⚡ Electricidad</span>
                    <span class="recurso-detalle-valor ${PanelRecursos.#claseRecurso(recurso.getElectricity())}">
                        ${recurso.getElectricity()}
                    </span>
                </div>
                <div class="recurso-detalle-item">
                    <span class="recurso-detalle-nombre">💧 Agua</span>
                    <span class="recurso-detalle-valor ${PanelRecursos.#claseRecurso(recurso.getWater())}">
                        ${recurso.getWater()}
                    </span>
                </div>
                <div class="recurso-detalle-item">
                    <span class="recurso-detalle-nombre">🌽 Alimentos</span>
                    <span class="recurso-detalle-valor">${recurso.getFood()}</span>
                </div>
                <div class="recurso-detalle-item">
                    <span class="recurso-detalle-nombre">🏗️ Edificios</span>
                    <span class="recurso-detalle-valor">${estado.edificios}</span>
                </div>
            `;
        }

        // ── Panel ciudadanos ──────────────────────────────
        PanelRecursos.#setValor('stat-total-ciudadanos', estado.poblacion);
    }

    /**
     * Actualiza la barra y personaje de felicidad.
     * @param {number} felicidad - promedio 0-100
     */
    static actualizarFelicidad(felicidad) {
        PanelRecursos.#setValor('stat-felicidad', `${felicidad}%`);

        const barra = document.getElementById('barra-felicidad-fill');
        if (barra) barra.style.width = `${felicidad}%`;

        // Cambiar Homer segun felicidad
        const homer = document.getElementById('homer-panel');
        if (!homer) return;
        if      (felicidad > 70) homer.style.backgroundImage = "url('../../assets/personajes/homer_feliz.png')";
        else if (felicidad < 40) homer.style.backgroundImage = "url('../../assets/personajes/homer_triste.png')";
        else                     homer.style.backgroundImage = "url('../../assets/personajes/homer_normal.png')";
    }

    // ── Privados ──────────────────────────────────────────
    static #setValor(id, valor) {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    }

    static #colorearRecurso(id, valor) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('alerta', 'peligro');
        if      (valor < 0)  el.classList.add('peligro');
        else if (valor < 20) el.classList.add('alerta');
    }

    static #claseRecurso(valor) {
        if (valor < 0)  return 'negativo';
        if (valor < 20) return 'bajo';
        return '';
    }

    static #colorearDinero(id, dinero) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove('dinero-verde', 'dinero-amarillo', 'dinero-rojo');

    if (dinero > 10000) {
        el.classList.add('dinero-verde');
    } else if (dinero < 1000) {
        el.classList.add('dinero-rojo');
    } else if (dinero < 5000) {
        el.classList.add('dinero-amarillo');
    }
    }
}