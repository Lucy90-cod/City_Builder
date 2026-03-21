/**
 * PantallaGameOver.js
 * Pantalla completa de Game Over con mensaje humorístico,
 * estadísticas finales y opciones de reintentar o salir.
 */

export class PantallaGameOver {

    static #MENSAJES = {
        electricidad: 'Tu ciudad volvió a la edad de las cavernas.\nLos ciudadanos están muy decepcionados... y en la oscuridad.',
        agua:         'Nadie quiere vivir en un desierto.\nNi tus ciudadanos.',
        ambos:        'Lograste lo imposible: una ciudad sin luz Y sin agua.\nFelicitaciones, alcalde.',
    };

    static #CAUSAS_TEXTO = {
        electricidad: 'Sin electricidad ⚡',
        agua:         'Sin agua 💧',
        ambos:        'Sin electricidad ni agua ⚡💧',
    };

    /**
     * Muestra la pantalla de Game Over con animación dramática.
     * @param {Ciudad}   ciudad
     * @param {string}   causa         - 'electricidad' | 'agua' | 'ambos'
     * @param {Function} onReintentar  - callback para recargar la partida
     * @param {Function} onMenuPrincipal - callback para ir al menú
     */
    static mostrar(ciudad, causa, onReintentar, onMenuPrincipal) {
        // 1. Sacudir la pantalla
        document.body.classList.add('gameover-shake');
        document.body.addEventListener('animationend', () => {
            document.body.classList.remove('gameover-shake');
        }, { once: true });

        // 2. Crear overlay y añadirlo al DOM
        const overlay = document.createElement('div');
        overlay.id        = 'gameover-overlay';
        overlay.className = 'gameover-overlay';
        overlay.innerHTML = PantallaGameOver.#generarHTML(ciudad, causa);
        document.body.appendChild(overlay);

        // 3. Animar entrada: oscurecer → aparecer panel
        requestAnimationFrame(() => {
            overlay.classList.add('activo');
            setTimeout(() => {
                overlay.querySelector('.gameover-panel').classList.add('visible');
            }, 400);
        });

        // 4. Conectar botones
        overlay.querySelector('#btn-go-reintentar').addEventListener('click', onReintentar);
        overlay.querySelector('#btn-go-menu').addEventListener('click', onMenuPrincipal);
    }

    // ── HTML ─────────────────────────────────────────────────

    static #generarHTML(ciudad, causa) {
        const estado    = ciudad.getEstado();
        const mensaje   = PantallaGameOver.#MENSAJES[causa]      ?? '¡Tu ciudad colapsó!';
        const causaTxt  = PantallaGameOver.#CAUSAS_TEXTO[causa]  ?? 'Recursos agotados';
        const poblacion = ciudad.getCiudadanos().length;

        return `
        <div class="gameover-panel">
            <div class="gameover-skull">💀</div>
            <h1 class="gameover-titulo">GAME OVER</h1>
            <p class="gameover-mensaje">${mensaje.replace('\n', '<br>')}</p>

            <div class="gameover-stats">
                <div class="gameover-stat">
                    <span>🏙️ Ciudad</span>
                    <span>${estado.nombre}</span>
                </div>
                <div class="gameover-stat">
                    <span>👤 Alcalde</span>
                    <span>${estado.nombreAlcalde}</span>
                </div>
                <div class="gameover-stat">
                    <span>⏱️ Turnos sobrevividos</span>
                    <span>${estado.turnoActual}</span>
                </div>
                <div class="gameover-stat">
                    <span>👥 Población final</span>
                    <span>${poblacion} ciudadano(s)</span>
                </div>
                <div class="gameover-stat">
                    <span>🏆 Puntuación final</span>
                    <span>${estado.score.toLocaleString()}</span>
                </div>
                <div class="gameover-stat">
                    <span>💣 Causa del colapso</span>
                    <span class="gameover-causa-valor">${causaTxt}</span>
                </div>
            </div>

            <div class="gameover-botones">
                <button id="btn-go-reintentar" class="btn-go btn-go-reintentar">
                    🔄 Reintentar
                </button>
                <button id="btn-go-menu" class="btn-go btn-go-menu">
                    🏠 Menú Principal
                </button>
            </div>

            <p class="gameover-footer">💀 Guardado en el ranking automáticamente</p>
        </div>`;
    }
}
