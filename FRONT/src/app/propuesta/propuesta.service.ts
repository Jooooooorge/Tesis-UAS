import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

  getPropuestasDocente(filtros?: { tipo?: string; estado_postulacion?: string }): Observable<Propuesta[]> {
    let params = new HttpParams();
    if (filtros?.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros?.estado_postulacion) params = params.set('estado_postulacion', filtros.estado_postulacion);
    
    return this.http.get<any[]>(`${API}/propuestas/docente`, { headers: this.headers(), params }).pipe(
      map(propuestas => propuestas.map(p => this.mapToPropuesta(p)))
    );
  }

  getPropuestasAlumno(): Observable<Propuesta[]> {
    return this.http.get<any[]>(`${API}/propuestas/alumno`, { headers: this.headers() }).pipe(
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

  private getIniciales(nombre: string | undefined | null): string {
    if (!nombre) return 'NA';
    const words = nombre.trim().split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  private getTimeAgo(dateString: string): string {
    if (!dateString) return 'Desconocido';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 14) return 'Hace 1 semana';
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}