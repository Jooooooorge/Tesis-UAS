import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Proyecto } from './proyecto.model';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.css',
})
export class Proyectos {
  constructor(private router: Router) {}

  abrirProyecto(id: number) {
    this.router.navigate(['/inicio/proyectos', id]);
  }

  proyectos = signal<Proyecto[]>([
    {
      id: 1,
      titulo: 'Sistema de Gestión de Inventario con ML',
      etapa: 'Etapa 2: Desarrollo del Prototipo',
      estado: 'En revisión por Codirector',
      estadoTipo: 'revision',
      progreso: 65,
      director: 'Dr. Luis Hernández',
      directorIniciales: 'DLH',
      codirector: 'Dra. Patricia Rojas',
      codirectorIniciales: 'DPR',
      ultimaActualizacion: '15 Mar 2026',
    },
    {
      id: 2,
      titulo: 'Plataforma de E-Learning con Gamificación',
      etapa: 'Etapa 1: Documentación del Prototipo',
      estado: 'Requiere correcciones',
      estadoTipo: 'correcciones',
      progreso: 45,
      director: 'Dr. Carlos Mendoza',
      directorIniciales: 'DCM',
      codirector: 'Dra. Ana Martínez',
      codirectorIniciales: 'DAM',
      ultimaActualizacion: '10 Mar 2026',
    },
    {
      id: 3,
      titulo: 'Chatbot Inteligente para Atención al Cliente',
      etapa: 'Etapa 3: Implementación Final',
      estado: 'Aprobado',
      estadoTipo: 'aprobado',
      progreso: 85,
      director: 'Dra. Patricia López',
      directorIniciales: 'DPL',
      codirector: 'Dr. Roberto Flores',
      codirectorIniciales: 'DRF',
      ultimaActualizacion: '18 Mar 2026',
    },
  ]);
}
