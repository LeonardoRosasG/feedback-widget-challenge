import type { FeedbackConfig, EventType, EventCallback, FeedbackPayload } from './types';
import { ApiClient, FeedbackApiError } from './api';
import { UserStorage } from './storage';
import { generateStyles } from './styles';

/**
 * FeedbackWidget - Clase principal del SDK
 * 
 * Patrón de diseño: 
 * - Singleton opcional (permite múltiples instancias si es necesario)
 * - Event-driven (eventos para comunicación con el host)
 * - Encapsulación completa del DOM
 */
export class FeedbackWidget {
  private config: FeedbackConfig;
  private apiClient: ApiClient;
  private userStorage: UserStorage;
  private eventListeners: Map<EventType, Set<EventCallback>>;
  
  // Referencias DOM
  private container: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private modal: HTMLDivElement | null = null;
  private styleElement: HTMLStyleElement | null = null;
  
  // Estado
  private isOpen = false;
  private isSubmitting = false;
  private currentRating = 0;
  private isInitialized = false;

  constructor(config: FeedbackConfig) {
    this.validateConfig(config);
    this.config = this.mergeWithDefaults(config);
    this.apiClient = new ApiClient(config.apiUrl, config.apiKey);
    this.userStorage = new UserStorage();
    this.eventListeners = new Map();
  }

  /**
   * Valida la configuración requerida.
   * Falla temprano si faltan campos críticos.
   */
  private validateConfig(config: FeedbackConfig): void {
    if (!config.projectId?.trim()) {
      throw new Error('FeedbackWidget: projectId is required');
    }
    if (!config.apiKey?.trim()) {
      throw new Error('FeedbackWidget: apiKey is required');
    }
    if (!config.apiUrl?.trim()) {
      throw new Error('FeedbackWidget: apiUrl is required');
    }
  }

  /**
   * Combina la configuración del usuario con valores por defecto.
   */
  private mergeWithDefaults(config: FeedbackConfig): FeedbackConfig {
    return {
      ...config,
      theme: config.theme || 'light',
      position: config.position || 'bottom-right',
      labels: {
        title: config.labels?.title || '¿Cómo fue tu experiencia?',
        placeholder: config.labels?.placeholder || 'Cuéntanos más (opcional)...',
        submit: config.labels?.submit || 'Enviar',
        cancel: config.labels?.cancel || 'Cancelar',
        success: config.labels?.success || '¡Gracias por tu feedback!',
      },
    };
  }

  /**
   * Inicializa el widget inyectando estilos y creando el contenedor.
   * Solo se ejecuta una vez (idempotente).
   */
  private initialize(): void {
    if (this.isInitialized) return;

    // Inyectar estilos
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'feedback-widget-styles';
    this.styleElement.textContent = generateStyles(this.config);
    document.head.appendChild(this.styleElement);

    // Crear contenedor principal
    this.container = document.createElement('div');
    this.container.id = 'feedback-widget-container';
    document.body.appendChild(this.container);

    this.isInitialized = true;
  }

  /**
   * Abre el modal de feedback.
   */
  open(): void {
    if (this.isOpen) return;
    
    this.initialize();
    this.currentRating = 0;
    this.isSubmitting = false;
    
    this.render();
    this.isOpen = true;
    
    // Animación de entrada (siguiente frame para que CSS transition funcione)
    requestAnimationFrame(() => {
      this.overlay?.classList.add('fbw-visible');
      this.modal?.classList.add('fbw-visible');
    });

    this.emit('open');
    
    // Manejar ESC para cerrar
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Cierra el modal de feedback.
   */
  close(): void {
    if (!this.isOpen) return;

    // Animación de salida
    this.overlay?.classList.remove('fbw-visible');
    this.modal?.classList.remove('fbw-visible');

    // Esperar a que termine la animación
    setTimeout(() => {
      if (this.container) {
        this.container.innerHTML = '';
      }
      this.overlay = null;
      this.modal = null;
      this.isOpen = false;
      this.emit('close');
    }, 200);

    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Maneja el evento de teclado para cerrar con ESC.
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen && !this.isSubmitting) {
      this.close();
    }
  };

  /**
   * Renderiza el contenido del modal.
   */
  private render(): void {
    if (!this.container) return;

    const labels = this.config.labels!;

    // Crear overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'fbw-overlay';
    this.overlay.addEventListener('click', () => {
      if (!this.isSubmitting) this.close();
    });

    // Crear modal
    this.modal = document.createElement('div');
    this.modal.className = 'fbw-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'fbw-title');
    
    this.modal.innerHTML = `
      <div class="fbw-header">
        <h2 class="fbw-title" id="fbw-title">${this.escapeHtml(labels.title!)}</h2>
        <button class="fbw-close" aria-label="Cerrar" type="button">&times;</button>
      </div>
      <div class="fbw-stars" role="radiogroup" aria-label="Calificación">
        ${[1, 2, 3, 4, 5].map(n => `
          <button 
            class="fbw-star" 
            data-rating="${n}" 
            type="button"
            role="radio"
            aria-checked="false"
            aria-label="${n} estrella${n > 1 ? 's' : ''}"
          >★</button>
        `).join('')}
      </div>
      <textarea 
        class="fbw-textarea" 
        placeholder="${this.escapeHtml(labels.placeholder!)}"
        aria-label="Comentario opcional"
      ></textarea>
      <div class="fbw-actions">
        <button class="fbw-btn fbw-btn-secondary" type="button">
          ${this.escapeHtml(labels.cancel!)}
        </button>
        <button class="fbw-btn fbw-btn-primary" type="button" disabled>
          ${this.escapeHtml(labels.submit!)}
        </button>
      </div>
    `;

    // Event listeners
    this.modal.querySelector('.fbw-close')?.addEventListener('click', () => this.close());
    this.modal.querySelector('.fbw-btn-secondary')?.addEventListener('click', () => this.close());
    this.modal.querySelector('.fbw-btn-primary')?.addEventListener('click', () => this.submit());

    // Estrellas
    this.modal.querySelectorAll('.fbw-star').forEach((star) => {
      star.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const rating = parseInt(target.dataset.rating || '0', 10);
        this.setRating(rating);
      });

      // Hover effect
      star.addEventListener('mouseenter', (e) => {
        const target = e.target as HTMLElement;
        const rating = parseInt(target.dataset.rating || '0', 10);
        this.highlightStars(rating);
      });

      star.addEventListener('mouseleave', () => {
        this.highlightStars(this.currentRating);
      });
    });

    // Prevenir que clicks en el modal cierren el overlay
    this.modal.addEventListener('click', (e) => e.stopPropagation());

    this.container.appendChild(this.overlay);
    this.container.appendChild(this.modal);

    // Focus en el modal para accesibilidad
    this.modal.focus();
  }

  /**
   * Establece la calificación actual.
   */
  private setRating(rating: number): void {
    this.currentRating = rating;
    this.highlightStars(rating);
    
    // Actualizar estado aria
    this.modal?.querySelectorAll('.fbw-star').forEach((star, index) => {
      star.setAttribute('aria-checked', (index + 1 === rating).toString());
    });

    // Habilitar botón de submit
    const submitBtn = this.modal?.querySelector('.fbw-btn-primary') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }

  /**
   * Resalta las estrellas hasta el rating indicado.
   */
  private highlightStars(rating: number): void {
    this.modal?.querySelectorAll('.fbw-star').forEach((star, index) => {
      star.classList.toggle('fbw-filled', index < rating);
    });
  }

  /**
   * Envía el feedback al backend.
   */
  private async submit(): Promise<void> {
    if (this.currentRating === 0 || this.isSubmitting) return;

    this.isSubmitting = true;
    const submitBtn = this.modal?.querySelector('.fbw-btn-primary') as HTMLButtonElement;
    const textarea = this.modal?.querySelector('.fbw-textarea') as HTMLTextAreaElement;
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="fbw-loading"></span>Enviando...`;
    }

    const payload: FeedbackPayload = {
      projectId: this.config.projectId,
      userId: this.userStorage.getUserId(),
      rating: this.currentRating,
      comment: textarea?.value.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await this.apiClient.submitFeedback(payload);
      
      this.emit('submit', payload);
      this.emit('success', response);
      
      // Mostrar mensaje de éxito
      this.showMessage(this.config.labels!.success!, 'success');
      
      // Cerrar después de un momento
      setTimeout(() => this.close(), 2000);
      
    } catch (error) {
      this.isSubmitting = false;
      
      const errorMessage = error instanceof FeedbackApiError 
        ? error.message 
        : 'Error al enviar feedback';
      
      this.emit('error', { error, payload });
      this.showMessage(errorMessage, 'error');
      
      // Restaurar botón
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = this.config.labels!.submit!;
      }
    }
  }

  /**
   * Muestra un mensaje en el modal.
   */
  private showMessage(message: string, type: 'success' | 'error'): void {
    const content = this.modal?.querySelector('.fbw-stars, .fbw-textarea, .fbw-actions');
    if (!content || !this.modal) return;

    // Ocultar formulario y mostrar mensaje
    const formElements = this.modal.querySelectorAll('.fbw-stars, .fbw-textarea, .fbw-actions');
    formElements.forEach(el => (el as HTMLElement).style.display = 'none');

    const messageDiv = document.createElement('div');
    messageDiv.className = `fbw-message fbw-${type}`;
    messageDiv.textContent = message;
    
    this.modal.appendChild(messageDiv);
  }

  /**
   * Escapa HTML para prevenir XSS.
   */
  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==================== Event System ====================

  /**
   * Registra un listener para un evento.
   */
  on(event: EventType, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Remueve un listener de un evento.
   */
  off(event: EventType, callback: EventCallback): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Emite un evento a todos los listeners.
   */
  private emit(event: EventType, data?: unknown): void {
    this.eventListeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`FeedbackWidget: Error in ${event} handler`, error);
      }
    });
  }

  // ==================== Public Utilities ====================

  /**
   * Obtiene el userId actual.
   */
  getUserId(): string {
    return this.userStorage.getUserId();
  }

  /**
   * Verifica la conexión con el backend.
   */
  async checkConnection(): Promise<boolean> {
    return this.apiClient.healthCheck();
  }

  /**
   * Destruye el widget y limpia recursos.
   */
  destroy(): void {
    this.close();
    this.styleElement?.remove();
    this.container?.remove();
    this.eventListeners.clear();
    this.isInitialized = false;
  }
}