import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesService, Notificacion } from './notificaciones.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class Notificaciones implements OnInit {
  notificaciones = signal<Notificacion[]>([]);
  loading = signal(true);
  unreadCount = computed(() => this.notificaciones().filter(n => !n.leida).length);

  constructor(private notificacionesService: NotificacionesService) {}

  ngOnInit() {
    this.cargarNotificaciones();
  }

  private cargarNotificaciones() {
    this.loading.set(true);
    this.notificacionesService.getNotificaciones().subscribe({
      next: (data) => {
        this.notificaciones.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
        this.loading.set(false);
      }
    });
  }

  marcarLeida(id: number) {
    this.notificacionesService.marcarLeida(id).subscribe({
      next: () => {
        this.notificaciones.update(list =>
          list.map(n => n.id_notificacion === id ? { ...n, leida: true } : n)
        );
      },
      error: (err) => console.error('Error al marcar como leída:', err)
    });
  }

  marcarTodasLeidas() {
    this.notificacionesService.marcarTodasLeidas().subscribe({
      next: () => {
        this.notificaciones.update(list =>
          list.map(n => ({ ...n, leida: true }))
        );
      },
      error: (err) => console.error('Error al marcar todas como leídas:', err)
    });
  }

  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'postulacion': return '📋';
      case 'proyecto': return '📁';
      case 'revision': return '📝';
      case 'propuesta': return '📄';
      default: return '🔔';
    }
  }

  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'postulacion': return 'Postulación';
      case 'proyecto': return 'Proyecto';
      case 'revision': return 'Revisión';
      case 'propuesta': return 'Propuesta';
      default: return 'General';
    }
  }
}
