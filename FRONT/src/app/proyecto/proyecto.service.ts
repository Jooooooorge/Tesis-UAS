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
    const rol = this.auth.getRol();
    const endpoint = rol === 'Docente' ? 'docente' : 'alumno';
    return this.http.get<any[]>(`${API}/proyectos/${endpoint}`, { headers: this.headers() }).pipe(
      map(proyectosBackend => proyectosBackend.map(p => this.mapToProyecto(p)))
    );
  }

  getProyectoById(id: number): Observable<Proyecto> {
    return this.http.get<any>(`${API}/proyectos/${id}`, { headers: this.headers() }).pipe(
      map(p => this.mapToProyecto(p))
    );
  }

  uploadFile(idProyecto: number, tipo: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id_proyecto', idProyecto.toString());
    formData.append('tipo', tipo);
    // Don't set Content-Type header manually, browser sets it with boundary for FormData
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
    return this.http.post<any>(`${API}/revisiones/upload`, formData, { headers });
  }

  evaluarRevision(idRevision: number, estado: string, comentario: string): Observable<any> {
    return this.http.patch<any>(
      `${API}/revisiones/${idRevision}/estado`,
      { estado, comentario },
      { headers: this.headers() }
    );
  }

  generarDocumentoCompleto(idProyecto: number, etapa: string): Observable<any> {
    return this.http.post<any>(
      `${API}/revisiones/generar-documento-completo`,
      { id_proyecto: idProyecto, etapa },
      { headers: this.headers() }
    );
  }

  private mapToProyecto(p: any): Proyecto {
    return {
      id: p.id_proyecto || p.id,
      titulo: p.titulo,
      etapa: p.etapa,
      estado: p.estado,
      estadoTipo: p.estado_tipo || 'revision',
      progreso: p.progreso || 0,
      director: p.director?.nombre || 'Sin asignar',
      directorIniciales: this.getIniciales(p.director?.nombre),
      codirector: p.codirector?.nombre || 'Sin asignar',
      codirectorIniciales: this.getIniciales(p.codirector?.nombre),
      ultimaActualizacion: p.ultima_actualizacion ? new Date(p.ultima_actualizacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
      revisiones: p.revisiones || []
    };
  }

  private getIniciales(nombre: string | undefined | null): string {
    if (!nombre || nombre === 'Sin asignar') return 'N/A';
    const words = nombre.trim().split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
