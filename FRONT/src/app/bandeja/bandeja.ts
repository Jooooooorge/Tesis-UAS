import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bandeja',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bandeja-container">
      <div class="page-header">
        <h1 class="page-title">Bandeja de Entrada</h1>
        <p class="page-subtitle">Comunicaciones y notificaciones de tus proyectos</p>
      </div>

      <div class="inbox-layout">
        <!-- Sidebar -->
        <div class="inbox-sidebar">
          <div class="sidebar-menu">
            <button class="menu-item active">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>
              Recibidos
              <span class="badge">{{ unreadCount() }}</span>
            </button>
            <button class="menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Enviados
            </button>
            <button class="menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Destacados
            </button>
          </div>
        </div>

        <!-- Message List -->
        <div class="message-list-container">
          <div class="message-list">
            @for (msg of mensajes(); track msg.id) {
              <div class="message-item" [class.unread]="!msg.leido" (click)="marcarLeido(msg.id)">
                <div class="sender-avatar">{{ msg.iniciales }}</div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="sender-name">{{ msg.remitente }}</span>
                    <span class="message-date">{{ msg.fecha }}</span>
                  </div>
                  <div class="message-subject">{{ msg.asunto }}</div>
                  <div class="message-preview">{{ msg.vistaPrevia }}</div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .bandeja-container { padding: 2rem; max-width: 1400px; margin: 0 auto; height: calc(100vh - 4rem); display: flex; flex-direction: column; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { color: #6b7280; margin-top: 0.5rem; }
    
    .inbox-layout { display: flex; flex: 1; gap: 1.5rem; overflow: hidden; background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    
    .inbox-sidebar { width: 240px; border-right: 1px solid #e5e7eb; padding: 1.5rem; background: #f9fafb; }
    .sidebar-menu { display: flex; flex-direction: column; gap: 0.5rem; }
    .menu-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; border: none; background: transparent; cursor: pointer; color: #4b5563; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; }
    .menu-item:hover { background: #e5e7eb; color: #111827; }
    .menu-item.active { background: #eff6ff; color: #2563eb; }
    .icon { width: 1.25rem; height: 1.25rem; }
    .badge { margin-left: auto; background: #2563eb; color: white; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.75rem; }
    
    .message-list-container { flex: 1; overflow-y: auto; }
    .message-item { display: flex; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.2s; }
    .message-item:hover { background: #f9fafb; }
    .message-item.unread { background: #eff6ff; }
    .message-item.unread .sender-name { font-weight: 700; color: #111827; }
    .message-item.unread .message-subject { font-weight: 600; color: #1f2937; }
    
    .sender-avatar { width: 40px; height: 40px; border-radius: 50%; background: #dbeafe; color: #1e40af; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; flex-shrink: 0; }
    
    .message-content { flex: 1; min-width: 0; }
    .message-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem; }
    .sender-name { font-weight: 500; color: #374151; font-size: 0.95rem; }
    .message-date { font-size: 0.8rem; color: #6b7280; }
    .message-subject { font-size: 0.95rem; color: #374151; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .message-preview { font-size: 0.875rem; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  `
})
export class Bandeja {
  mensajes = signal([
    {
      id: 1,
      remitente: 'Coordinación Académica',
      iniciales: 'CA',
      asunto: 'Recordatorio: Fecha límite de entrega de actas',
      vistaPrevia: 'Estimados docentes, les recordamos que la fecha límite para la entrega de actas de revisión es este viernes...',
      fecha: '10:30 AM',
      leido: false
    },
    {
      id: 2,
      remitente: 'María García',
      iniciales: 'MG',
      asunto: 'Duda sobre el formato del protocolo',
      vistaPrevia: 'Profesor, tengo una duda sobre la sección de metodología en el protocolo. ¿Podría revisar mi avance?',
      fecha: 'Ayer',
      leido: false
    },
    {
      id: 3,
      remitente: 'Sistema ThesisFlow',
      iniciales: 'TF',
      asunto: 'Nuevo proyecto asignado',
      vistaPrevia: 'Has sido asignado como Director en el proyecto "App Móvil para Monitoreo de Salud". Por favor revisa los detalles.',
      fecha: '08 May',
      leido: true
    }
  ]);

  unreadCount() {
    return this.mensajes().filter(m => !m.leido).length;
  }

  marcarLeido(id: number) {
    this.mensajes.update(list => 
      list.map(m => m.id === id ? { ...m, leido: true } : m)
    );
  }
}
