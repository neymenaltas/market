import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "@/environments/environment";
import {SocketService} from "@services/socket.service";

@Injectable({
  providedIn: 'root'
})
export class PlaceService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, public socketService: SocketService) {}

  getPlaces(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/owner/places/${userId}`);
  }

  getCrashMessage(placeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/owner/crash-message/${placeId}`);
  }

  updateCrashMessage(placeId: string, crashMessage: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/owner/crash-message/${placeId}`, { crashMessage });
  }
}





