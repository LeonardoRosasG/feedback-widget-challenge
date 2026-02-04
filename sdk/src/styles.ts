import type { FeedbackConfig } from './types';

/**
 * Genera los estilos CSS del widget.
 * 
 * Consideraciones
 * - Usar prefijo único para evitar colisiones
 */
export function generateStyles(config: FeedbackConfig): string {
  const theme = config.theme || 'light';
  const position = config.position || 'bottom-right';

  const colors = {
    light: {
      bg: '#ffffff',
      text: '#1a1a1a',
      textSecondary: '#666666',
      border: '#e0e0e0',
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      starEmpty: '#d1d5db',
      starFilled: '#fbbf24',
      overlay: 'rgba(0, 0, 0, 0.5)',
      error: '#dc2626',
      success: '#16a34a',
    },
    dark: {
      bg: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      starEmpty: '#4b5563',
      starFilled: '#fbbf24',
      overlay: 'rgba(0, 0, 0, 0.7)',
      error: '#f87171',
      success: '#4ade80',
    },
  };

  const c = colors[theme];

  const positionStyles = {
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;',
    'center': 'top: 50%; left: 50%; translate: -50% -50%;',
  };

  return `
    .fbw-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: ${c.overlay};
      z-index: 999998;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .fbw-overlay.fbw-visible {
      opacity: 1;
    }

    .fbw-modal {
      position: fixed;
      ${positionStyles[position]}
      width: 360px;
      max-width: calc(100vw - 40px);
      background: ${c.bg};
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                  0 10px 10px -5px rgba(0, 0, 0, 0.04);
      z-index: 999999;
      padding: 24px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transform: scale(0.9);
      opacity: 0;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }

    .fbw-modal.fbw-visible {
      transform: scale(1);
      opacity: 1;
    }

    .fbw-modal * {
      box-sizing: border-box;
    }

    .fbw-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .fbw-title {
      font-size: 18px;
      font-weight: 600;
      color: ${c.text};
      margin: 0;
    }

    .fbw-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: ${c.textSecondary};
      font-size: 24px;
      line-height: 1;
      transition: color 0.2s;
    }

    .fbw-close:hover {
      color: ${c.text};
    }

    .fbw-stars {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 20px;
    }

    .fbw-star {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      font-size: 32px;
      color: ${c.starEmpty};
      transition: color 0.15s, transform 0.15s;
    }

    .fbw-star:hover {
      transform: scale(1.1);
    }

    .fbw-star.fbw-filled {
      color: ${c.starFilled};
    }

    .fbw-star:focus {
      outline: 2px solid ${c.primary};
      outline-offset: 2px;
      border-radius: 4px;
    }

    .fbw-textarea {
      width: 100%;
      min-height: 100px;
      padding: 12px;
      border: 1px solid ${c.border};
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      background: ${c.bg};
      color: ${c.text};
      margin-bottom: 16px;
      transition: border-color 0.2s;
    }

    .fbw-textarea:focus {
      outline: none;
      border-color: ${c.primary};
    }

    .fbw-textarea::placeholder {
      color: ${c.textSecondary};
    }

    .fbw-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .fbw-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .fbw-btn-secondary {
      background: transparent;
      color: ${c.textSecondary};
      border: 1px solid ${c.border};
    }

    .fbw-btn-secondary:hover {
      background: ${c.border};
    }

    .fbw-btn-primary {
      background: ${c.primary};
      color: white;
    }

    .fbw-btn-primary:hover:not(:disabled) {
      background: ${c.primaryHover};
    }

    .fbw-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .fbw-message {
      text-align: center;
      padding: 20px;
      font-size: 14px;
    }

    .fbw-message.fbw-error {
      color: ${c.error};
    }

    .fbw-message.fbw-success {
      color: ${c.success};
    }

    .fbw-loading {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: fbw-spin 0.8s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }

    @keyframes fbw-spin {
      to { transform: rotate(360deg); }
    }
  `;
}