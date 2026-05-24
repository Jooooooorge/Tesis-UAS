import { Component, signal, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacionesService, Notificacion } from './notificaciones.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class NotificacionesComponent implements OnInit {
  private notificacionesService = inject(NotificacionesService);

  notificaciones = signal<Notificacion[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  mostrarSoloNoLeidas = signal(false);

  ngOnInit() {
    this.cargarNotificaciones();

    // Recargar notificaciones cada 30 segundos
    setInterval(() => this.cargarNotificaciones(), 30000);
  }

  cargarNotificaciones() {
    this.loading.set(true);
    this.errorMsg.set('');

    this.notificacionesService.getNotificaciones().subscribe({
      next: (data) => {
        this.notificaciones.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al cargar las notificaciones.');
        this.loading.set(false);
      }
    });
  }

  get notificacionesFiltradas(): Notificacion[] {
    if (this.mostrarSoloNoLeidas()) {
      return this.notificaciones().filter(n => !n.leida);
    }
    return this.notificaciones();
  }

  get totalNoLeidas(): number {
    return this.notificaciones().filter(n => !n.leida).length;
  }

  marcarLeida(notificacion: Notificacion) {
    if (notificacion.leida) return;

    this.notificacionesService.marcarLeida(notificacion.id_notificacion).subscribe({
      next: () => {
        notificacion.leida = true;
        this.notificaciones.set([...this.notificaciones()]);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al marcar la notificación como leída.');
      }
    });
  }

  marcarTodasLeidas() {
    this.notificacionesService.marcarTodasLeidas().subscribe({
      next: () => {
        this.cargarNotificaciones();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al marcar todas las notificaciones como leídas.');
      }
    });
  }

  getIconByType(tipo: string): string {
    switch (tipo) {
      case 'propuesta':
        return '📋';
      case 'postulacion':
        return '📧';
      case 'proyecto':
        return '📂';
      case 'revision':
        return '✅';
      default:
        return '🔔';
    }
  }

  getColorByType(tipo: string): string {
    switch (tipo) {
      case 'propuesta':
        return 'bg-blue-100 border-blue-300';
      case 'postulacion':
        return 'bg-purple-100 border-purple-300';
      case 'proyecto':
        return 'bg-green-100 border-green-300';
      case 'revision':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  }

  getTiempoTranscurrido(fecha: string): string {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora.getTime() - fechaNotif.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutos < 1) return 'Hace unos segundos';
    if (diffMinutos < 60) return `Hace ${diffMinutos}m`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    return `Hace ${diffDias}d`;
  }
}
