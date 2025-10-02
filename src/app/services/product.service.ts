import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {SocketService} from "@services/socket.service";
import {environment} from "@/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, public socketService: SocketService) { }

  registerProduct(placeId:string, productName: string, regularPrice: number, minPrice: number, maxPrice?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/owner/${placeId}/register-product`, {productName, regularPrice, minPrice, maxPrice});
  }

  getProducts(placeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/owner/products/${placeId}`);
  }

  createOrder(placeId: string, orderProduct: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/worker/create-order`, {placeId, products: orderProduct});
  }

  getWorkerOrders(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/worker/get-orders/${userId}`);
  }

  getPlaceOrders(placeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/owner/get-orders/${placeId}`);
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/owner/products/${productId}`);
  }

  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/worker/orders/${orderId}`);
  }

  startExchange(placeId: string, intervalMs: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/owner/start-exchange/${placeId}`, {intervalMs});
  }

  stopExchange(placeId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/owner/reset-prices/${placeId}`, {placeId});
  }

  // WebSocket bağlantısını başlat
  async connectToPriceUpdates(placeId: string): Promise<void> {
    try {
      await this.socketService.subscribeToPlace(placeId);
    } catch (error) {
      console.error('WebSocket bağlantı hatası:', error);
      throw error;
    }
  }

  // WebSocket bağlantısını kapat
  disconnectFromPriceUpdates(placeId: string): void {
    this.socketService.unsubscribeFromPlace(placeId);
  }

  // Fiyat güncellemelerini dinle
  getPriceUpdates(): Observable<any> {
    return this.socketService.onPriceUpdate();
  }

  // İlk fiyatları dinle
  getInitialPrices(): Observable<any> {
    return this.socketService.onInitialPrices();
  }

  // Hataları dinle
  getErrors(): Observable<any> {
    return this.socketService.onError();
  }

  editProduct(productId:string, productName: string, regularPrice: number, minPrice: number, maxPrice?: number, currentPrice?:number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/owner/product/${productId}`, {productName, regularPrice, minPrice, maxPrice, currentPrice});
  }
}
