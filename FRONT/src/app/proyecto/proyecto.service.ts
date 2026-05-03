import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { map, Observable } from 'rxjs';
import { Proyecto } from './proyecto.model';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<any[]>(`${API}/proyectos`, { headers: this.headers() }).pipe(
      map(proyectosBackend => proyectosBackend.map(p => this.mapToProyecto(p)))
    );
  }

  getProyectoById(id: number): Observable<Proyecto> {
    return this.http.get<any>(`${API}/proyectos/${id}`, { headers: this.headers() }).pipe(
      map(p => this.mapToProyecto(p))
    );
  }

  private mapToProyecto(p: any): Proyecto {
    return {
      id: p.id,
      titulo: p.titulo,
      etapa: p.etapa,
      estado: p.estado,
      estadoTipo: p.estado_tipo || 'revision',
      progreso: p.progreso || 0,
      director: p.users_proyectos_director_idTousers?.nombre || 'Sin asignar',
      directorIniciales: this.getIniciales(p.users_proyectos_director_idTousers?.nombre),
      codirector: p.users_proyectos_codirector_idTousers?.nombre || 'Sin asignar',
      codirectorIniciales: this.getIniciales(p.users_proyectos_codirector_idTousers?.nombre),
      ultimaActualizacion: p.ultima_actualizacion ? new Date(p.ultima_actualizacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'
    };
  }

  private getIniciales(nombre: string | undefined | null): string {
    if (!nombre || nombre === 'Sin asignar') return 'N/A';
    const words = nombre.trim().split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
