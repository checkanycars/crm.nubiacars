// Simple toast notification utility without external dependencies
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private getToastStyles(type: ToastType): string {
    const baseStyles = `
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      min-width: 300px;
      max-width: 500px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      transition: opacity 0.3s ease-out;
    `;

    const typeStyles: Record<ToastType, string> = {
      success: 'background-color: #10b981; color: white;',
      error: 'background-color: #ef4444; color: white;',
      warning: 'background-color: #f59e0b; color: white;',
      info: 'background-color: #3b82f6; color: white;',
    };

    return baseStyles + typeStyles[type];
  }

  private getIcon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16.666 5l-9.166 9.167-4.167-4.167" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 5.833v5M10 14.167h.008" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="10" cy="10" r="8.333"/>
      </svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 6.667v3.333M10 13.333h.008M10 18.333a8.333 8.333 0 100-16.666 8.333 8.333 0 000 16.666z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 9.167v4.166M10 6.667h.008M18.333 10a8.333 8.333 0 11-16.666 0 8.333 8.333 0 0116.666 0z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    };
    return icons[type];
  }

  show(message: string, type: ToastType = 'info', options: ToastOptions = {}) {
    const { duration = 3000 } = options;
    
    const container = this.ensureContainer();
    
    const toast = document.createElement('div');
    toast.style.cssText = this.getToastStyles(type);
    
    toast.innerHTML = `
      <div style="flex-shrink: 0;">${this.getIcon(type)}</div>
      <div style="flex: 1;">${message}</div>
      <button style="flex-shrink: 0; background: none; border: none; cursor: pointer; color: inherit; padding: 0; display: flex; align-items: center; opacity: 0.8;" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 4L4 12M4 4l8 8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    if (!document.getElementById('toast-animations')) {
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    container.appendChild(toast);
    
    const closeButton = toast.querySelector('button');
    const remove = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        if (container.children.length === 0 && container.parentNode) {
          container.parentNode.removeChild(container);
          this.container = null;
        }
      }, 300);
    };
    
    if (closeButton) {
      closeButton.addEventListener('click', remove);
    }
    
    if (duration > 0) {
      setTimeout(remove, duration);
    }
  }

  success(message: string, options?: ToastOptions) {
    this.show(message, 'success', options);
  }

  error(message: string, options?: ToastOptions) {
    this.show(message, 'error', options);
  }

  warning(message: string, options?: ToastOptions) {
    this.show(message, 'warning', options);
  }

  info(message: string, options?: ToastOptions) {
    this.show(message, 'info', options);
  }
}

export const toast = new ToastManager();