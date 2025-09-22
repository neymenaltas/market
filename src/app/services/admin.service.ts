import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "@/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registerPlace(placeName: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/register-place`, {placeName});
  }

  createOwner(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/create-owner`, {username, password});
  }

  getOwners(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/owners`);
  }

  getPlaces(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/places`);
  }

  assignOwnerToPlace(ownerId: string, placeId: string) {
    return this.http.put<any>(`${this.apiUrl}/admin/assign-owner-to-place`, {ownerId, placeId});
  }
}





