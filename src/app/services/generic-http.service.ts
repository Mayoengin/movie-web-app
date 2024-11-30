import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GenericHttpService {
  baseUrl: string = 'https://api.themoviedb.org/3/';

  constructor(private httpClient: HttpClient) {}

  httpGet<T>(url: string): Observable<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    console.log('Full API URL:', fullUrl); // Debug log
    return this.httpClient.get<T>(fullUrl, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${environment.token}`,
      }),
    });
  }
}
