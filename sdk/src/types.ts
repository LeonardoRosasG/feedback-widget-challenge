export interface FeedbackConfig {
  projectId: string;
  apiKey: string;
  apiUrl: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left' | 'center';
  labels?: {
    title?: string;
    placeholder?: string;
    submit?: string;
    cancel?: string;
    success?: string;
  };
}

export interface FeedbackPayload {
  projectId: string;
  userId: string;
  rating: number;
  comment?: string;
  timestamp: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedbackId?: string;
}

export type EventType = 'open' | 'close' | 'submit' | 'error' | 'success';
export type EventCallback = (data?: unknown) => void;