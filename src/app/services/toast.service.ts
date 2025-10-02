// services/toast.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

export interface ToastConfig {
  message: string;
  title?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private isBrowser: boolean;

  constructor(
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  show(config: ToastConfig) {
    if (!this.isBrowser) return;

    const isMobile = this.checkIsMobile();
    const options = this.getToastOptions(isMobile, config.duration);

    switch (config.type) {
      case 'success':
        this.toastr.success(config.message, config.title, options);
        break;
      case 'error':
        this.toastr.error(config.message, config.title, options);
        break;
      case 'warning':
        this.toastr.warning(config.message, config.title, options);
        break;
      case 'info':
        this.toastr.info(config.message, config.title, options);
        break;
    }
  }

  private checkIsMobile(): boolean {
    if (!this.isBrowser) return false;
    return window.innerWidth < 768;
  }

  private getToastOptions(isMobile: boolean, duration?: number) {
    return {
      timeOut: duration || 1000,
      positionClass: isMobile ? 'toast-top-center' : 'toast-top-right',
      tapToDismiss: isMobile,
      closeButton: false,
      enableHtml: false,
      toastClass: isMobile ? 'mobile-toast' : 'desktop-toast'
    };
  }

  // Hızlı kullanım metodları
  success(message: string, title?: string) {
    this.show({ message, title, type: 'success' });
  }

  error(message: string, title?: string) {
    this.show({ message, title, type: 'error' });
  }

  warning(message: string, title?: string) {
    this.show({ message, title, type: 'warning' });
  }

  info(message: string, title?: string) {
    this.show({ message, title, type: 'info' });
  }
}
