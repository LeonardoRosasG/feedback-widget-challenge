import type { FeedbackPayload, FeedbackResponse } from './types';

export class ApiClient {
  private apiUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(apiUrl: string, apiKey: string, timeout = 10000) {
    // Remover trailing slash para consistencia
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.timeout = timeout;
  }

  /**
   * Envía el feedback al backend.
   * 
   * Consideraciones:
   * - Usa AbortController para timeout (evita requests colgados)
   * - Incluye API key en header para autenticación
   * - Maneja diferentes tipos de errores con mensajes claros
   */
  async submitFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.apiUrl}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new FeedbackApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof FeedbackApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new FeedbackApiError('Request timeout', 408);
        }
        throw new FeedbackApiError(error.message, 0);
      }
      
      throw new FeedbackApiError('Unknown error occurred', 0);
    }
  }

  /**
   * Verifica la conexión con el backend.
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        method: 'GET',
        headers: { 'X-Api-Key': this.apiKey },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class FeedbackApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'FeedbackApiError';
  }
}