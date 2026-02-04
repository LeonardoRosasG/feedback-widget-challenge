const STORAGE_KEY = 'feedback_widget_user_id';

/**
 * Genera un UUID v4 para identificar usuarios únicos.
 * Usamos crypto.randomUUID si está disponible (navegadores modernos),
 * sino fallback a implementación manual.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para navegadores antiguos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Obtiene o crea un userId persistente.
 * 
 * Estrategia de almacenamiento:
 * 1. Intenta localStorage (persiste entre sesiones)
 * 2. Fallback a sessionStorage (persiste solo en la sesión)
 * 3. Fallback a memoria (no persiste)
 * 
 * Esto maneja casos donde el usuario tiene storage deshabilitado.
 */
export class UserStorage {
  private memoryFallback: string | null = null;

  getUserId(): string {
    // Intentar obtener de localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
      
      const newId = generateUUID();
      localStorage.setItem(STORAGE_KEY, newId);
      return newId;
    } catch {
      // localStorage no disponible, intentar sessionStorage
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        
        const newId = generateUUID();
        sessionStorage.setItem(STORAGE_KEY, newId);
        return newId;
      } catch {
        // Fallback a memoria
        if (!this.memoryFallback) {
          this.memoryFallback = generateUUID();
        }
        return this.memoryFallback;
      }
    }
  }

  clearUserId(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar errores
    }
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar errores
    }
    this.memoryFallback = null;
  }
}