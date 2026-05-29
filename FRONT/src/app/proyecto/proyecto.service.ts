import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { map, Observable, forkJoin, switchMap, of } from 'rxjs';
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
      switchMap(proyectosBackend => {
        // Si no hay proyectos, retornar array vacío
        if (proyectosBackend.length === 0) {
          return of([]);
        }

        // Para cada proyecto, obtener sus revisiones usando getProyectoById
        const projectsWithRevisions$ = proyectosBackend.map(p => {
          const id = p.id_proyecto || p.id;
          return this.http.get<any>(`${API}/proyectos/${id}`, { headers: this.headers() }).pipe(
            map(fullProject => this.mapToProyecto(fullProject))
          );
        });

        // Ejecutar todas las llamadas en paralelo
        return forkJoin(projectsWithRevisions$);
      })
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

  generarDocumentoCompleto(idProyecto: number, etapa: string): Observable<Blob> {
    return this.http.post<Blob>(
      `${API}/revisiones/generar-documento-completo`,
      { id_proyecto: idProyecto, etapa },
      {
        headers: this.headers(),
        responseType: 'blob' as 'json'
      }
    );
  }

  private mapToProyecto(p: any): Proyecto {
    const revisiones = p.revisiones || [];
    const progreso = this.calcularProgreso(revisiones);

    return {
      id: p.id_proyecto || p.id,
      titulo: p.titulo,
      etapa: p.etapa,
      estado: p.estado,
      estadoTipo: p.estado_tipo || 'revision',
      progreso: progreso,
      director: p.director?.nombre || 'Sin asignar',
      directorIniciales: this.getIniciales(p.director?.nombre),
      codirector: p.codirector?.nombre || 'Sin asignar',
      codirectorIniciales: this.getIniciales(p.codirector?.nombre),
      ultimaActualizacion: p.ultima_actualizacion ? new Date(p.ultima_actualizacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
      revisiones: revisiones
    };
  }

  private calcularProgreso(revisiones: any[]): number {
    const etapasBase = [
      {
        subetapas: [
          { nombre: 'Descripción' },
          { nombre: 'Diagramas de C.U.' },
          { nombre: 'Arquitectura' },
          { nombre: 'Entidad-Relación' },
          { nombre: 'Interfaces' },
          { nombre: 'Documento completo', esDocumentoCompleto: true },
        ],
      },
      {
        subetapas: [
          { nombre: 'Avance 25%' },
          { nombre: 'Avance 50%' },
          { nombre: 'Avance 75%' },
          { nombre: 'Avance 100%' },
        ],
      },
      {
        subetapas: [
          { nombre: 'Objetivos' },
          { nombre: 'Antecedentes' },
          { nombre: 'Planteamiento del problema' },
          { nombre: 'Preguntas de investigación' },
          { nombre: 'Justificación' },
          { nombre: 'Viabilidad' },
          { nombre: 'Metodología' },
          { nombre: 'Documento completo', esDocumentoCompleto: true },
        ],
      },
      {
        subetapas: [
          { nombre: 'Revisión de literatura' },
          { nombre: 'Desarrollo de conceptos' },
          { nombre: 'Documento completo', esDocumentoCompleto: true },
        ],
      },
    ];

    // Contar el total de subetapas (excluyendo documentos completos inicialmente)
    let totalSubetapas = 0;
    let subetapasAprobadas = 0;

    etapasBase.forEach((etapa) => {
      etapa.subetapas.forEach((sub: any) => {
        if (!sub.esDocumentoCompleto) {
          totalSubetapas++;
          // Verificar si esta subetapa está aprobada
          const revision = revisiones.find((r: any) => r.tipo === sub.nombre);
          if (revision && revision.estado === 'aceptada') {
            subetapasAprobadas++;
          }
        }
      });
    });

    if (totalSubetapas === 0) return 0;
    return Math.round((subetapasAprobadas / totalSubetapas) * 100);
  }

  private getIniciales(nombre: string | undefined | null): string {
    if (!nombre || nombre === 'Sin asignar') return 'N/A';
    const words = nombre.trim().split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}
