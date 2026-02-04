import { FeedbackWidget } from './FeedbackWidget';
import type { FeedbackConfig } from './types';

// Export para uso como módulo ES
export { FeedbackWidget };
export type { FeedbackConfig, FeedbackPayload, FeedbackResponse } from './types';

/**
 * Singleton para uso via script tag.
 * Permite una API más simple: FeedbackWidget.init() / .open()
 */
let globalInstance: FeedbackWidget | null = null;

const FeedbackWidgetGlobal = {
  /**
   * Inicializa el widget globalmente.
   * Uso: FeedbackWidget.init({ projectId: '...', apiKey: '...', apiUrl: '...' })
   */
  init(config: FeedbackConfig): FeedbackWidget {
    if (globalInstance) {
      globalInstance.destroy();
    }
    globalInstance = new FeedbackWidget(config);
    return globalInstance;
  },

  /**
   * Abre el modal de feedback.
   */
  open(): void {
    if (!globalInstance) {
      console.error('FeedbackWidget: Call init() before open()');
      return;
    }
    globalInstance.open();
  },

  /**
   * Cierra el modal de feedback.
   */
  close(): void {
    globalInstance?.close();
  },

  /**
   * Registra un listener para eventos.
   */
  on(event: 'open' | 'close' | 'submit' | 'error' | 'success', callback: (data?: unknown) => void): void {
    if (!globalInstance) {
      console.error('FeedbackWidget: Call init() before on()');
      return;
    }
    globalInstance.on(event, callback);
  },

  /**
   * Obtiene la instancia actual (para uso avanzado).
   */
  getInstance(): FeedbackWidget | null {
    return globalInstance;
  },
};

// Exponer globalmente para uso via script tag
if (typeof window !== 'undefined') {
  (window as unknown as { FeedbackWidget: typeof FeedbackWidgetGlobal }).FeedbackWidget = FeedbackWidgetGlobal;
}

export default FeedbackWidgetGlobal;