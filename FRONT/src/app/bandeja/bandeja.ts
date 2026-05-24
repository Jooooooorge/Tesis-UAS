import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bandeja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bandeja.html',
  styleUrls: ['./bandeja.css']
})
export class Bandeja implements OnInit {
  loading = signal(true);
  mensajes = signal<any[]>([]);

  ngOnInit() {
    this.cargarMensajes();
  }

  private cargarMensajes() {
    this.loading.set(true);
    // setTimeout(() => {
    //   this.mensajes.set([
    //     {
    //       id: 1,
    //       remitente: 'Coordinación Académica',
    //       iniciales: 'CA',
    //       asunto: 'Recordatorio: Fecha límite de entrega de actas',
    //       vistaPrevia: 'Estimados docentes, les recordamos que la fecha límite para la entrega de actas de revisión es este viernes...',
    //       fecha: '10:30 AM',
    //       leido: false
    //     },
    //     {
    //       id: 2,
    //       remitente: 'María García',
    //       iniciales: 'MG',
    //       asunto: 'Duda sobre el formato del protocolo',
    //       vistaPrevia: 'Profesor, tengo una duda sobre la sección de metodología en el protocolo. ¿Podría revisar mi avance?',
    //       fecha: 'Ayer',
    //       leido: false
    //     },
    //     {
    //       id: 3,
    //       remitente: 'Sistema ThesisFlow',
    //       iniciales: 'TF',
    //       asunto: 'Nuevo proyecto asignado',
    //       vistaPrevia: 'Has sido asignado como Director en el proyecto "App Móvil para Monitoreo de Salud". Por favor revisa los detalles.',
    //       fecha: '08 May',
    //       leido: true
    //     }
    //   ]);
    //   this.loading.set(false);
    // });
  }

  unreadCount() {
    return this.mensajes().filter(m => !m.leido).length;
  }

  marcarLeido(id: number) {
    this.mensajes.update(list =>
      list.map(m => m.id === id ? { ...m, leido: true } : m)
    );
  }
}
