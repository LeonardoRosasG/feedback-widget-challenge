import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedbackWidget } from '../FeedbackWidget';

describe('FeedbackWidget', () => {
  const validConfig = {
    projectId: 'test-project',
    apiKey: 'test-api-key',
    apiUrl: 'http://localhost:5000',
  };

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const widget = new FeedbackWidget(validConfig);
      expect(widget).toBeInstanceOf(FeedbackWidget);
    });

    it('should throw error when projectId is missing', () => {
      expect(() => {
        new FeedbackWidget({
          ...validConfig,
          projectId: '',
        });
      }).toThrow('FeedbackWidget: projectId is required');
    });

    it('should throw error when apiKey is missing', () => {
      expect(() => {
        new FeedbackWidget({
          ...validConfig,
          apiKey: '',
        });
      }).toThrow('FeedbackWidget: apiKey is required');
    });

    it('should throw error when apiUrl is missing', () => {
      expect(() => {
        new FeedbackWidget({
          ...validConfig,
          apiUrl: '',
        });
      }).toThrow('FeedbackWidget: apiUrl is required');
    });
  });

  describe('default configuration', () => {
    it('should use default theme when not provided', () => {
      const widget = new FeedbackWidget(validConfig);
      // Access private config through any cast for testing
      expect((widget as any).config.theme).toBe('light');
    });

    it('should use default position when not provided', () => {
      const widget = new FeedbackWidget(validConfig);
      expect((widget as any).config.position).toBe('bottom-right');
    });

    it('should use default labels when not provided', () => {
      const widget = new FeedbackWidget(validConfig);
      const labels = (widget as any).config.labels;
      expect(labels.title).toBe('¿Cómo fue tu experiencia?');
      expect(labels.submit).toBe('Enviar');
      expect(labels.cancel).toBe('Cancelar');
    });

    it('should allow custom theme', () => {
      const widget = new FeedbackWidget({
        ...validConfig,
        theme: 'dark',
      });
      expect((widget as any).config.theme).toBe('dark');
    });

    it('should allow custom labels', () => {
      const widget = new FeedbackWidget({
        ...validConfig,
        labels: {
          title: 'Custom Title',
          submit: 'Send',
        },
      });
      const labels = (widget as any).config.labels;
      expect(labels.title).toBe('Custom Title');
      expect(labels.submit).toBe('Send');
    });
  });

  describe('event system', () => {
    it('should register and trigger event listeners', () => {
      const widget = new FeedbackWidget(validConfig);
      const mockCallback = vi.fn();

      widget.on('open', mockCallback);
      (widget as any).emit('open');

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple listeners for same event', () => {
      const widget = new FeedbackWidget(validConfig);
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      widget.on('submit', callback1);
      widget.on('submit', callback2);
      (widget as any).emit('submit', { rating: 5 });

      expect(callback1).toHaveBeenCalledWith({ rating: 5 });
      expect(callback2).toHaveBeenCalledWith({ rating: 5 });
    });

    it('should remove event listener with off()', () => {
      const widget = new FeedbackWidget(validConfig);
      const mockCallback = vi.fn();

      widget.on('close', mockCallback);
      widget.off('close', mockCallback);
      (widget as any).emit('close');

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});
