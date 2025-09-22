import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "@/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, {username, password});
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { username, password });
  }

  saveUserToLS(userData: any) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }

  getToken(): string {
    if (JSON.parse(<string>localStorage.getItem('userData'))?.user.token) {
      return JSON.parse(<string>localStorage.getItem('userData'))?.user.token;
    }
    return '';
  }

  getUserRole(): string | null {
    const userData = localStorage.getItem('userData');
    if (!userData) return null;
    return JSON.parse(userData).user?.role ?? null;
  }

  isOwner(): boolean {
    return this.getUserRole() === 'owner';
  }

  isWorker(): boolean {
    return this.getUserRole() === 'worker';
  }

  logout() {
    localStorage.removeItem('userData');
  }
}
