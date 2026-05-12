import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-revisiones',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="revisiones-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Revisiones Pendientes</h1>
          <p class="page-subtitle">Proyectos que requieren tu atención como director o codirector</p>
        </div>
      </div>

      <div class="revisiones-grid">
        @for (rev of revisiones(); track rev.id) {
          <div class="revision-card">
            <div class="card-header">
              <span class="badge" [class.urgent]="rev.diasPendiente > 3">{{ rev.tipo }}</span>
              <span class="date">Recibido: {{ rev.fechaRecepcion }}</span>
            </div>
            
            <h3 class="proyecto-titulo">{{ rev.proyectoTitulo }}</h3>
            <p class="estudiante-nombre">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-small"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {{ rev.estudiante }}
            </p>

            <div class="document-info">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-small"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>{{ rev.documentoAdjunto }}</span>
            </div>

            <div class="card-actions">
              <button class="btn btn-outline" (click)="verDetalle(rev.id)">Ver Detalles</button>
              <button class="btn btn-primary" (click)="aprobar(rev.id)">Aprobar</button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            <h3>Todo al día</h3>
            <p>No tienes revisiones pendientes en este momento.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .revisiones-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: #111827; margin: 0; }
    .page-subtitle { color: #6b7280; margin-top: 0.5rem; }
    
    .revisiones-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    
    .revision-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; display: flex; flex-direction: column; gap: 1rem; transition: transform 0.2s; }
    .revision-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: #dbeafe; color: #1e40af; }
    .badge.urgent { background: #fee2e2; color: #991b1b; }
    .date { font-size: 0.875rem; color: #6b7280; }
    
    .proyecto-titulo { font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0; line-height: 1.4; }
    
    .estudiante-nombre, .document-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #4b5563; margin: 0; }
    .icon-small { width: 1rem; height: 1rem; color: #6b7280; }
    
    .document-info { background: #f3f4f6; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem; }
    
    .card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: auto; padding-top: 1rem; }
    .btn { padding: 0.625rem 1rem; border-radius: 8px; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; text-align: center; }
    .btn-outline { background: transparent; border: 1px solid #d1d5db; color: #374151; }
    .btn-outline:hover { background: #f9fafb; border-color: #9ca3af; }
    .btn-primary { background: #2563eb; border: 1px solid transparent; color: white; }
    .btn-primary:hover { background: #1d4ed8; }
    
    .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; background: white; border-radius: 12px; border: 1px dashed #d1d5db; text-align: center; }
    .empty-icon { width: 4rem; height: 4rem; color: #10b981; margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0; }
    .empty-state p { color: #6b7280; margin: 0; }
  `
})
export class Revisiones {
  constructor(private router: Router) {}

  revisiones = signal([
    {
      id: 1,
      proyectoTitulo: 'Sistema de Gestión de Inventario con ML',
      estudiante: 'María García',
      tipo: 'Revisión de Protocolo',
      fechaRecepcion: '10 May 2026',
      diasPendiente: 2,
      documentoAdjunto: 'Protocolo_v2.pdf'
    },
    {
      id: 2,
      proyectoTitulo: 'App Móvil para Monitoreo de Salud',
      estudiante: 'Juan Pérez',
      tipo: 'Revisión de Capítulo 1',
      fechaRecepcion: '05 May 2026',
      diasPendiente: 7,
      documentoAdjunto: 'Capitulo1_Corregido.docx'
    }
  ]);

  verDetalle(id: number) {
    // Navigate to project detail
    this.router.navigate(['/inicio/proyectos']);
  }

  aprobar(id: number) {
    this.revisiones.update(list => list.filter(r => r.id !== id));
  }
}
