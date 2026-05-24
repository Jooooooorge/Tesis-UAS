import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-revisiones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revisiones.html',
  styleUrls: ['./revisiones.css']
})
export class Revisiones implements OnInit {
  constructor(private router: Router) {}

  loading = signal(true);
  revisiones = signal<any[]>([]);

  ngOnInit() {
    this.cargarRevisiones();
  }

  private cargarRevisiones() {
    this.loading.set(true);
    // setTimeout(() => {
    //   this.revisiones.set([
    //     {
    //       id: 1,
    //       proyectoTitulo: 'Sistema de Gestión de Inventario con ML',
    //       estudiante: 'María García',
    //       tipo: 'Revisión de Protocolo',
    //       fechaRecepcion: '10 May 2026',
    //       diasPendiente: 2,
    //       documentoAdjunto: 'Protocolo_v2.pdf'
    //     },
    //     {
    //       id: 2,
    //       proyectoTitulo: 'App Móvil para Monitoreo de Salud',
    //       estudiante: 'Juan Pérez',
    //       tipo: 'Revisión de Capítulo 1',
    //       fechaRecepcion: '05 May 2026',
    //       diasPendiente: 7,
    //       documentoAdjunto: 'Capitulo1_Corregido.docx'
    //     }
    //   ]);
    //   this.loading.set(false);
    // });
  }

  verDetalle(id: number) {
    // Navigate to project detail
    this.router.navigate(['/inicio/proyectos']);
  }

  aprobar(id: number) {
    this.revisiones.update(list => list.filter(r => r.id !== id));
  }
}
