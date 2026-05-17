import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropuestaBackend } from './propuesta.model';

const API = 'http://localhost:3000';

export interface CreatePropuestaPayload {
  titulo: string;
  descripcion: string;
  tipo: 'Busco_Director' | 'Busco_Estudiante';
  tecnologias?: string[];
}

export interface UpdatePropuestaPayload {
  titulo?: string;
  descripcion?: string;
  tipo?: 'Busco_Director' | 'Busco_Estudiante';
  tecnologias?: string[];
}

@Injectable({ providedIn: 'root' })
export class PropuestasService {
  private http = inject(HttpClient);

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /** Todas las propuestas — para Coordinador / Admin */
  getAll(): Observable<PropuestaBackend[]> {
    return this.http.get<PropuestaBackend[]>(`${API}/propuestas`, {
      headers: this.authHeaders(),
    });
  }

  /** Propuestas creadas por el alumno autenticado — requiere rol Estudiante */
  getByAlumno(): Observable<PropuestaBackend[]> {
    return this.http.get<PropuestaBackend[]>(`${API}/propuestas/alumno`, {
      headers: this.authHeaders(),
    });
  }

  /** Propuestas tipo "Busco Estudiante" — requiere rol Docente */
  getByDocente(filtros?: { tipo?: string; estadoPostulacion?: string }): Observable<PropuestaBackend[]> {
    let params = new HttpParams();
    if (filtros?.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros?.estadoPostulacion) params = params.set('estado_postulacion', filtros.estadoPostulacion);
    return this.http.get<PropuestaBackend[]>(`${API}/propuestas/docente`, {
      headers: this.authHeaders(),
      params,
    });
  }

  getOne(id: number): Observable<PropuestaBackend> {
    return this.http.get<PropuestaBackend>(`${API}/propuestas/${id}`, {
      headers: this.authHeaders(),
    });
  }

  create(data: CreatePropuestaPayload): Observable<PropuestaBackend> {
    return this.http.post<PropuestaBackend>(`${API}/propuestas`, data, {
      headers: this.authHeaders(),
    });
  }

  update(id: number, data: UpdatePropuestaPayload): Observable<PropuestaBackend> {
    return this.http.patch<PropuestaBackend>(`${API}/propuestas/${id}`, data, {
      headers: this.authHeaders(),
    });
  }

  remove(id: number): Observable<PropuestaBackend> {
    return this.http.delete<PropuestaBackend>(`${API}/propuestas/${id}`, {
      headers: this.authHeaders(),
    });
  }
}
