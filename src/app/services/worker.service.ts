import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "@/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registerWorker(username: string, password: string, placeId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/owner/register-worker`, {username, password, placeId});
  }

  getWorkers(placeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/owner/workers/${placeId}`);
  }

  deleteWorker(workerId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/owner/workers/${workerId}`);
  }

  editWorker(userId:string, username: string, password: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/owner/user/${userId}`, {username, password});
  }
}
