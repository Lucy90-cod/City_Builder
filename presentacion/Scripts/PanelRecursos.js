/**
 * PanelRecursos.js
 * Actualiza los valores de recursos en el DOM cada turno.
 * Se llama desde juego.js despues de cada turno completado.
 *
 * HU-015: muestra dinero con colores, electricidad/agua en formato
 *   "produccion / consumo", alimentos, poblacion y felicidad.
 *   Tooltip nativo (title) con desglose al hacer hover.
 */

export class PanelRecursos {

    /**
     * Actualiza todos los indicadores de recursos en el header y sidebar.
     * @param {Ciudad}              ciudad
     * @param {ControladorRecurso}  ctrlRecurso  - opcional, para datos del ultimo turno
     */
    static actualizar(ciudad, ctrlRecurso = null) {
        const recurso = ciudad.getRecurso();
        if (!recurso) return;

        const estado = ciudad.getEstado();
        const prod   = ctrlRecurso?.getUltimaProduccion() ?? {};
        const cons   = ctrlRecurso?.getUltimoConsumo()    ?? {};

        // ── Header ───────────────────────────────────────────
        PanelRecursos.#setValor('val-dinero',      `$${recurso.getMoney().toLocaleString('es-CO')}`);
        PanelRecursos.#colorearDinero('val-dinero', recurso.getMoney());

        PanelRecursos.#setValor('val-electricidad', recurso.getElectricity().toLocaleString());
        PanelRecursos.#setValor('val-agua',         recurso.getWater().toLocaleString());
        PanelRecursos.#setValor('val-alimentos',    recurso.getFood().toLocaleString());
        PanelRecursos.#setValor('val-poblacion',    estado.poblacion);
        PanelRecursos.#setValor('val-score',        estado.score.toLocaleString());
        PanelRecursos.#setValor('turno-actual',     `Turno ${ciudad.getTurnoActual()}`);
        PanelRecursos.#setValor('nombre-ciudad',    ciudad.getNombre());

        // Tooltips en header (produccion / consumo / balance)
        PanelRecursos.#setTitleTooltip('val-electricidad',
            prod.electricity ?? 0, cons.electricidad ?? 0, recurso.getElectricity());
        PanelRecursos.#setTitleTooltip('val-agua',
            prod.water ?? 0, cons.agua ?? 0, recurso.getWater());
        PanelRecursos.#setTitleTooltipDinero('val-dinero',
            prod.money ?? 0, cons.electricidad ?? 0, recurso.getMoney());

        // Colorear chips del header
        PanelRecursos.#colorearRecurso('recurso-elec',      recurso.getElectricity());
        PanelRecursos.#colorearRecurso('recurso-agua',      recurso.getWater());
        PanelRecursos.#colorearRecurso('recurso-alimentos', recurso.getFood());
        PanelRecursos.#colorearDinero('recurso-dinero',     recurso.getMoney());

        // ── Sidebar derecha — detalle ─────────────────────────
        const contenedor = document.getElementById('recursos-detalle');
        const desglose   = ciudad.getPuntuacion()?.getDesglose(ciudad);

        if (contenedor) {
            const prodElec  = prod.electricity  ?? 0;
            const consElec  = cons.electricidad ?? 0;
            const prodAgua  = prod.water        ?? 0;
            const consAgua  = cons.agua         ?? 0;
            const prodFood  = prod.food         ?? 0;
            const consFood  = cons.food         ?? 0;
            const balElec   = recurso.getElectricity();
            const balAgua   = recurso.getWater();
            const food      = recurso.getFood();

            contenedor.innerHTML = `
            <div class="recurso-detalle-item"
                 title="Ingreso: $${prodElec}\nMantenimiento: $${consElec}\nBalance acumulado: $${recurso.getMoney().toLocaleString('es-CO')}">
                <span class="recurso-detalle-nombre">💰 Dinero</span>
                <span class="recurso-detalle-valor ${recurso.getMoney() < 0 ? 'negativo' : ''}">
                    $${recurso.getMoney().toLocaleString('es-CO')}
                </span>
            </div>

            <div class="recurso-detalle-item"
                 title="Producción: ${prodElec}\nConsumo: ${consElec}\nBalance acumulado: ${balElec}">
                <span class="recurso-detalle-nombre">⚡ Electricidad</span>
                <span class="recurso-detalle-valor ${PanelRecursos.#claseRecurso(balElec)}">
                    ${prodElec} <span class="prod-cons-sep">/</span> ${consElec}
                    <span class="prod-cons-label">prod/cons</span>
                </span>
            </div>

            <div class="recurso-detalle-item"
                 title="Producción: ${prodAgua}\nConsumo: ${consAgua}\nBalance acumulado: ${balAgua}">
                <span class="recurso-detalle-nombre">💧 Agua</span>
                <span class="recurso-detalle-valor ${PanelRecursos.#claseRecurso(balAgua)}">
                    ${prodAgua} <span class="prod-cons-sep">/</span> ${consAgua}
                    <span class="prod-cons-label">prod/cons</span>
                </span>
            </div>

            <div class="recurso-detalle-item"
                 title="Producción: ${prodFood}\nConsumo ciudadanos: ${consFood}\nStock: ${food}">
                <span class="recurso-detalle-nombre">🌽 Alimentos</span>
                <span class="recurso-detalle-valor ${food <= 0 ? 'negativo' : ''}">
                    ${prodFood} <span class="prod-cons-sep">/</span> ${consFood}
                    <span class="prod-cons-label">prod/cons</span>
                </span>
            </div>

            <div class="recurso-detalle-item">
                <span class="recurso-detalle-nombre">👥 Población</span>
                <span class="recurso-detalle-valor">${estado.poblacion}</span>
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

                ${desglose.bonificaciones?.length ? `
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

                ${desglose.penalizaciones?.length ? `
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

        // ── Panel ciudadanos (sidebar izquierda) ──────────────
        PanelRecursos.#setValor('stat-total-ciudadanos', estado.poblacion);
    }

    /**
     * Actualiza la barra y personaje de felicidad.
     * Tambien actualiza el chip de felicidad en el header.
     * @param {number} felicidad - promedio 0-100
     */
    static actualizarFelicidad(felicidad) {
        PanelRecursos.#setValor('stat-felicidad',  `${felicidad}%`);
        PanelRecursos.#setValor('val-felicidad',   `${felicidad}%`);

        const barra = document.getElementById('barra-felicidad-fill');
        if (barra) barra.style.width = `${felicidad}%`;

        // Color del chip de felicidad en header
        const chip = document.getElementById('recurso-felicidad');
        if (chip) {
            chip.classList.remove('alerta', 'peligro');
            if      (felicidad < 40) chip.classList.add('peligro');
            else if (felicidad < 60) chip.classList.add('alerta');
        }

        // Cambiar Homer segun felicidad
        const homer = document.getElementById('homer-panel');
        if (!homer) return;
        if      (felicidad > 70) homer.style.backgroundImage = "url('../../assets/personajes/homer_feliz.png')";
        else if (felicidad < 40) homer.style.backgroundImage = "url('../../assets/personajes/homer_triste.png')";
        else                     homer.style.backgroundImage = "url('../../assets/personajes/homer_normal.png')";
    }

    // ── Privados ──────────────────────────────────────────────

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
        if      (dinero > 10000) el.classList.add('dinero-verde');
        else if (dinero < 1000)  el.classList.add('dinero-rojo');
        else if (dinero < 5000)  el.classList.add('dinero-amarillo');
    }

    static #setTitleTooltip(id, produccion, consumo, balance) {
        const el = document.getElementById(id);
        if (!el) return;
        el.title =
            `Producción: ${produccion}\n` +
            `Consumo: ${consumo}\n` +
            `Balance neto: ${balance >= 0 ? '+' : ''}${balance}`;
    }

    static #setTitleTooltipDinero(id, ingreso, mantenimiento, balance) {
        const el = document.getElementById(id);
        if (!el) return;
        el.title =
            `Ingreso: $${ingreso.toLocaleString('es-CO')}\n` +
            `Mantenimiento: $${mantenimiento.toLocaleString('es-CO')}\n` +
            `Balance: $${balance.toLocaleString('es-CO')}`;
    }
}
