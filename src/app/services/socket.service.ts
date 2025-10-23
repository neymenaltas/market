import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import {environment} from "@/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;
  private subscribers = new Map<string, number>(); // placeId -> subscriber count

  constructor() {
    console.log('🔄 SocketService oluşturuluyor...');

    // Environment'dan socket URL'i al
    this.socket = io(environment.socketUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      // Production'da HTTPS gerekli ise:
      secure: environment.production,
      // CORS için:
      withCredentials: true
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.socket.on('connect', () => {
      console.log('✅ WebSocket bağlantısı kuruldu');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket bağlantısı kesildi:', reason);
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket hatası:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket bağlantı hatası:', error);
    });
  }

  // Tekil bağlantı garantili connect metodu
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('ℹ️ WebSocket zaten bağlı');
      return;
    }

    if (this.connectionPromise) {
      // Bağlantı zaten deneniyor, promise'i bekle
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const connectTimeout = setTimeout(() => {
        reject(new Error('WebSocket bağlantı zaman aşımı'));
      }, 5000);

      this.socket.once('connect', () => {
        clearTimeout(connectTimeout);
        this.connectionPromise = null;
        resolve();
      });

      this.socket.once('connect_error', (error) => {
        clearTimeout(connectTimeout);
        this.connectionPromise = null;
        reject(error);
      });

      console.log('🔄 WebSocket bağlantısı deneniyor...');
      this.socket.connect();
    });

    return this.connectionPromise;
  }

  // Bağlantıyı kapat (sadece hiç subscriber kalmadıysa)
  disconnect(): void {
    if (this.subscribers.size === 0 && this.isConnected) {
      console.log('🔄 WebSocket bağlantısı kapatılıyor...');
      this.socket.disconnect();
    }
  }

  // Belirli bir mekana subscribe ol
  async subscribeToPlace(placeId: string): Promise<void> {
    try {
      await this.connect();

      const currentCount = this.subscribers.get(placeId) || 0;
      this.subscribers.set(placeId, currentCount + 1);

      if (currentCount === 0) {
        console.log(`📡 Mekan dinlenmeye başlanıyor: ${placeId}`);
        this.socket.emit('subscribe-to-place', placeId);
      } else {
        console.log(`📡 Mekan zaten dinleniyor (${currentCount + 1} subscriber): ${placeId}`);
      }
    } catch (error) {
      console.error('Subscribe hatası:', error);
      throw error;
    }
  }

  // Bir mekanı dinlemeyi bırak
  unsubscribeFromPlace(placeId: string): void {
    const currentCount = this.subscribers.get(placeId) || 0;

    if (currentCount > 1) {
      this.subscribers.set(placeId, currentCount - 1);
      console.log(`📡 Mekan subscriber sayısı azaltıldı (${currentCount - 1}): ${placeId}`);
    } else if (currentCount === 1) {
      this.subscribers.delete(placeId);
      console.log(`📡 Mekan dinleme durduruluyor: ${placeId}`);
      this.socket.emit('unsubscribe-from-place', placeId);

      // Tüm subscriber'lar gittiyse bağlantıyı kapat
      if (this.subscribers.size === 0) {
        this.disconnect();
      }
    }
  }

  // İlk fiyatları dinle
  onInitialPrices(): Observable<any> {
    return new Observable(observer => {
      const listener = (data: any) => {
        console.log('✅ İlk fiyatlar alındı:', data.length, 'ürün');
        observer.next(data);
      };

      this.socket.on('initial-prices', listener);

      // Observable unsubscribe olduğunda listener'ı temizle
      return () => {
        this.socket.off('initial-prices', listener);
      };
    });
  }

  // Fiyat güncellemelerini dinle
  onPriceUpdate(): Observable<any> {
    return new Observable(observer => {
      const listener = (data: any) => {
        console.log('🔄 Fiyat güncellemesi alındı:', data);
        observer.next(data);
      };

      this.socket.on('price-update', listener);

      return () => {
        this.socket.off('price-update', listener);
      };
    });
  }

  // Hata mesajlarını dinle
  onError(): Observable<any> {
    return new Observable(observer => {
      const listener = (data: any) => {
        console.error('❌ Socket hatası:', data);
        observer.next(data);
      };

      this.socket.on('error', listener);

      return () => {
        this.socket.off('error', listener);
      };
    });
  }

  // Aktif subscriber'ları getir
  getSubscribers(): Map<string, number> {
    return new Map(this.subscribers);
  }

  // Crash message güncellemelerini dinle
  onCrashMessageUpdate(): Observable<any> {
    return new Observable(observer => {
      const listener = (data: any) => {
        console.log('📢 Crash message güncellendi:', data);
        observer.next(data);
      };

      this.socket.on('crash-message-updated', listener);

      return () => {
        this.socket.off('crash-message-updated', listener);
      };
    });
  }
}
