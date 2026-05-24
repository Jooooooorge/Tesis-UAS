import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { map, Observable } from 'rxjs';
import { Propuesta } from './propuesta.model';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class PropuestaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getPropuestas(): Observable<Propuesta[]> {
    return this.http.get<any[]>(`${API}/propuestas`, { headers: this.headers() }).pipe(
      map(propuestas => propuestas.map(p => this.mapToPropuesta(p)))
    );
  }

  createPropuesta(propuesta: Partial<Propuesta>): Observable<Propuesta> {
    const payload = {
      titulo: propuesta.titulo,
      descripcion: propuesta.descripcion,
      tipo: propuesta.tipo === 'Busco Director' ? 'Busco_Director' : 'Busco_Estudiante',
      tecnologias: propuesta.tecnologias
    };
    return this.http.post<any>(`${API}/propuestas`, payload, { headers: this.headers() }).pipe(
      map(p => this.mapToPropuesta({ ...p, users: { nombre: this.auth.getUser()?.nombre } }))
    );
  }

  updatePropuesta(id: number, propuesta: Partial<Propuesta>): Observable<Propuesta> {
    const payload = {
      titulo: propuesta.titulo,
      descripcion: propuesta.descripcion,
      tipo: propuesta.tipo === 'Busco Director' ? 'Busco_Director' : 'Busco_Estudiante',
      tecnologias: propuesta.tecnologias
    };
    return this.http.patch<any>(`${API}/propuestas/${id}`, payload, { headers: this.headers() }).pipe(
      map(p => this.mapToPropuesta({ ...p, users: { nombre: propuesta.creador?.nombre } }))
    );
  }

  deletePropuesta(id: number): Observable<any> {
    return this.http.delete(`${API}/propuestas/${id}`, { headers: this.headers() });
  }

  private mapToPropuesta(p: any): Propuesta {
    const tipoNormalizado = p.tipo === 'Busco_Director' || p.tipo === 'Busco Director' 
      ? 'Busco Director' 
      : 'Busco Estudiante';

    return {
      id_propuesta: p.id_propuesta || p.id,
      titulo: p.titulo,
      descripcion: p.descripcion,
      tipo: tipoNormalizado as 'Busco Director' | 'Busco Estudiante',
      tecnologias: Array.isArray(p.tecnologias) ? p.tecnologias : typeof p.tecnologias === 'string' ? JSON.parse(p.tecnologias) : [],
      created_at: p.created_at,
      updated_at: p.updated_at,
      creador: p.creador || p.users || { id_usuario: p.id_creador, nombre: p.users?.nombre || 'Usuario Desconocido', email: p.users?.email || '' },
      postulaciones: p.postulaciones,
      cantidad_postulaciones: p.cantidad_postulaciones || p.postulaciones?.length || 0
    };
  }
}