import { Injectable } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { Cliente } from './cliente'
import {Observable,of , throwError} from 'rxjs';
import { HttpClient, HttpHeaders,HttpEvent, HttpRequest } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import swal from 'sweetalert2';

import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private urlEndPoint:string = 'http://localhost:8080/api/clientes'

  private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})

  constructor(private http: HttpClient, private router: Router) { }

  getClientes(page: number): Observable<any> {
    //return of(CLIENTES);
    return this.http.get<Cliente[]>(this.urlEndPoint + '/page/' + page).pipe(
      map((response: any) => {
        (response.content as Cliente[]).map(cliente =>{
          cliente.nombre = cliente.nombre.toUpperCase();
          //cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyy', 'en-US');
          return cliente;
        });
        return response;
      })
    );
  }

  create(cliente: Cliente) : Observable<Cliente>{
    return this.http.post(this.urlEndPoint, cliente, {headers: this.httpHeaders} ).pipe(
      map((response: any) =>response.cliente as Cliente),
      catchError(e => {

        if (e.status ==400) {
            return throwError(e);
        }


        console.error(e.error.mensaje);
        swal.fire('Error al crear cliente', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  getCliente(id): Observable<Cliente>{
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        this.router.navigate(['/clientes']);
        console.error(e.error.mensaje);
        swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  update(cliente: Cliente): Observable<any>{
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente, {headers: this.httpHeaders}).pipe(
      catchError(e => {

        if (e.status ==400) {
            return throwError(e);
        }

        console.error(e.error.mensaje);
        swal.fire('Error al editar cliente', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Cliente>{
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`, {headers: this.httpHeaders}).pipe(
      catchError(e => {
        console.error(e.error.mensaje);
        swal.fire('Error al eliminar cliente', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  subirFoto(archivo: File, id): Observable<HttpEvent<{}>>{
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req);
  }
}
