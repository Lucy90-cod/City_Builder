/**
 * notificaciones.js
 * Sistema de alertas visuales sin usar alert() ni confirm().
 * Las notificaciones aparecen en #notificaciones-contenedor
 * y desaparecen automaticamente.
 */

export class Notificaciones {

    static #DURACION_MS = 3500;

    /** Notificacion verde — accion exitosa */
    static mostrarExito(mensaje) {
        Notificaciones.#mostrar(mensaje, 'exito', '✔');
    }

    /** Notificacion roja — error o accion no permitida */
    static mostrarError(mensaje) {
        Notificaciones.#mostrar(mensaje, 'error', '✘');
    }

    /** Notificacion naranja — advertencia */
    static mostrarAlerta(mensaje) {
        Notificaciones.#mostrar(mensaje, 'alerta', '⚠');
    }

    /** Notificacion especial — game over */
    static mostrarGameOver() {
        Notificaciones.#mostrar(
            '¡GAME OVER! Los recursos llegaron a cero.',
            'game-over', '💀',
            8000  // mas tiempo visible
        );
    }

    /** Notificacion informativa */
    static mostrarInfo(mensaje) {
        Notificaciones.#mostrar(mensaje, 'info', 'ℹ');
    }

    // ── Privado ───────────────────────────────────────────────
    static #mostrar(mensaje, tipo, icono, duracion = Notificaciones.#DURACION_MS) {
        const contenedor = document.getElementById('notificaciones-contenedor');
        if (!contenedor) return;

        const notif = document.createElement('div');
        notif.className = `notificacion notificacion-${tipo}`;
        notif.innerHTML = `
            <span class="notif-icono">${icono}</span>
            <span class="notif-mensaje">${mensaje}</span>
            <button class="notif-cerrar">✕</button>
        `;

        // Boton cerrar manual
        notif.querySelector('.notif-cerrar').addEventListener('click', () => {
            Notificaciones.#remover(notif);
        });

        contenedor.appendChild(notif);

        // Animar entrada
        requestAnimationFrame(() => notif.classList.add('visible'));

        // Auto-remover despues de la duracion
        setTimeout(() => Notificaciones.#remover(notif), duracion);
    }

    static #remover(notif) {
        notif.classList.remove('visible');
        notif.addEventListener('transitionend', () => notif.remove(), { once: true });
    }
}