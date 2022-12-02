import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
// import { Observable } from 'rxjs';+
import { hostApi } from '../globals';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DownloadServiceService {
  private hostApiData = `${hostApi}/data/`;

  constructor(private http: HttpClient) {}
  

  downloadFile(id: string): any {
    const theURL = `${this.hostApiData}download/${id}`;
    return this.http.get(theURL, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    });
  }


  
  downloadFile2(url: string): any {
        return this.http.get(url, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob',
    }).pipe(map(response =>  response));
  }

  // downloadFile(): Observable<any>{
  // 	return this.http.get('http://localhost:8080/employees/download', {responseType: ResponseContentType.Blob});
  // }
}
