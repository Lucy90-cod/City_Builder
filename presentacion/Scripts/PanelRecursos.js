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
        PanelRecursos.#setTooltip('val-electricidad', ciudad, 'electricidad');
        PanelRecursos.#setTooltip('val-agua', ciudad, 'agua');
        PanelRecursos.#setTooltip('val-dinero', ciudad, 'dinero');
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
        const desglose = ciudad.getPuntuacion()?.getDesglose(ciudad);
        
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

            <!-- DESGLOSE DE SCORE -->
            ${desglose ? `
                <hr>
                <div class="recurso-detalle-item" style="font-weight:700;color:var(--texto-acento)">
                    <span>🏆 Puntuación</span>
                    <span>${desglose.total?.toLocaleString() ?? 0}</span>
                </div>

                <div class="recurso-detalle-item">
                    <span>👥 Población (×10)</span>
                    <span>+${desglose.puntosPoblacion}</span>
                </div>
                <div class="recurso-detalle-item">
                    <span>😊 Felicidad (×5)</span>
                    <span>+${desglose.puntosFelicidad}</span>
                </div>
                <div class="recurso-detalle-item">
                    <span>🏗️ Edificios (×50)</span>
                    <span>+${desglose.puntosEdificios}</span>
                </div>
                <div class="recurso-detalle-item">
                    <span>💰 Dinero (/100)</span>
                    <span>${desglose.puntosDinero >= 0 ? '+' : ''}${desglose.puntosDinero}</span>
                </div>
                <div class="recurso-detalle-item">
                    <span>⚡ Electricidad (×2)</span>
                    <span>${desglose.puntosElectricidad >= 0 ? '+' : ''}${desglose.puntosElectricidad}</span>
                </div>
                <div class="recurso-detalle-item">
                    <span>💧 Agua (×2)</span>
                    <span>${desglose.puntosAgua >= 0 ? '+' : ''}${desglose.puntosAgua}</span>
                </div>

                ${desglose.bonificaciones.length ? `
                    <div class="recurso-detalle-item" style="margin-top:4px;font-weight:600;color:#4caf50">
                        <span>✨ Bonificaciones</span>
                    </div>
                    ${desglose.bonificaciones.map(b => `
                        <div class="recurso-detalle-item">
                            <span>${b.nombre}</span>
                            <span style="color:#4caf50">+${b.valor}</span>
                        </div>
                    `).join('')}
                ` : ''}

                ${desglose.penalizaciones.length ? `
                    <div class="recurso-detalle-item" style="margin-top:4px;font-weight:600;color:#ef9a9a">
                        <span>⚠️ Penalizaciones</span>
                    </div>
                    ${desglose.penalizaciones.map(p => `
                        <div class="recurso-detalle-item">
                            <span>${p.nombre}</span>
                            <span class="negativo">${p.valor}</span>
                        </div>
                    `).join('')}
                ` : ''}
            ` : ''}
        
        
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

static #setTooltip(id, ciudad, tipo) {
    const el = document.getElementById(id);
    if (!el) return;

    let produccion = 0;
    let consumo = 0;

    ciudad.getEdificios().forEach(e => {
        const prod = e.calcularProduccion();
        const cons = e.calcularConsumo();

        if (tipo === 'electricidad') {
            produccion += prod.electricity || 0;
            consumo    += cons.electricidad || 0;
        }

        if (tipo === 'agua') {
            produccion += prod.water || 0;
            consumo    += cons.agua || 0;
        }

        if (tipo === 'dinero') {
            produccion += prod.money || 0;
            consumo    += e.getCostoMantenimiento() || 0;
        }
    });

    const balance = produccion - consumo;

    el.title =
        `Producción: ${produccion}\n` +
        `Consumo: ${consumo}\n` +
        `Balance: ${balance}`;
}

}

