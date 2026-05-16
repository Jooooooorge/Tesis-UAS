import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { map, Observable } from 'rxjs';
import { Postulacion } from '../propuesta/propuesta.model';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class PostulacionService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getPostulaciones(): Observable<Postulacion[]> {
    return this.http.get<any[]>(`${API}/postulaciones`, { headers: this.headers() }).pipe(
      map(postulaciones => postulaciones.map(p => this.mapToPostulacion(p)))
    );
  }

  getMisPostulaciones(): Observable<Postulacion[]> {
    return this.http.get<any[]>(`${API}/postulaciones/mis-postulaciones`, { headers: this.headers() }).pipe(
      map(postulaciones => postulaciones.map(p => this.mapToPostulacion(p)))
    );
  }

  createPostulacion(data: { id_propuesta: number; mensaje?: string }): Observable<Postulacion> {
    return this.http.post<any>(`${API}/postulaciones`, data, { headers: this.headers() }).pipe(
      map(p => this.mapToPostulacion(p))
    );
  }

  cambiarEstado(id: number, estado: 'aceptada' | 'rechazada'): Observable<Postulacion> {
    return this.http.patch<any>(`${API}/postulaciones/${id}/estado`, { estado }, { headers: this.headers() }).pipe(
      map(p => this.mapToPostulacion(p))
    );
  }

  private mapToPostulacion(p: any): Postulacion {
    return {
      id_postulacion: p.id_postulacion,
      id_propuesta: p.id_propuesta,
      id_usuario: p.id_usuario,
      mensaje: p.mensaje,
      estado: p.estado,
      created_at: p.created_at,
      updated_at: p.updated_at,
      propuesta: p.propuesta,
      users: p.users
    };
  }
}