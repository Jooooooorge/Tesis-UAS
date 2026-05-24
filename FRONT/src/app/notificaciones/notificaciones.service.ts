import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

const API = 'http://localhost:3000';

export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  tipo: 'propuesta' | 'postulacion' | 'revision' | 'proyecto';
  titulo: string;
  mensaje: string;
  id_referencia: number;
  tabla_referencia: string;
  leida: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  getNotificaciones(leida?: boolean): Observable<Notificacion[]> {
    let params = new HttpParams();
    if (leida !== undefined) params = params.set('leida', leida.toString());

    return this.http.get<Notificacion[]>(`${API}/notificaciones`, { headers: this.headers(), params });
  }

  countNoLeidas(): Observable<number> {
    return this.http.get<number>(`${API}/notificaciones/no-leidas/count`, { headers: this.headers() });
  }

  marcarLeida(id: number): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${API}/notificaciones/${id}/leer`, {}, { headers: this.headers() });
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http.patch<void>(`${API}/notificaciones/leer-todas`, {}, { headers: this.headers() });
  }
}
