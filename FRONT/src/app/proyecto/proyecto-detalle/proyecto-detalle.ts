import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface SubEtapa {
  nombre: string;
  estado: 'completado' | 'en-revision' | 'pendiente';
}

interface Etapa {
  nombre: string;
  icono: string;
  subetapas: SubEtapa[];
}

interface ArchivoSubido {
  nombre: string;
  fecha: string;
  tamano: string;
}

interface Revision {
  autor: string;
  iniciales: string;
  rol: string;
  estado: 'aprobado' | 'correcciones';
  comentario: string;
  fecha: string;
}

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proyecto-detalle.html',
  styleUrl: './proyecto-detalle.css',
})
export class ProyectoDetalle {
  constructor(private router: Router) {}

  proyectoTitulo = 'Sistema de Gestión de Inventario con ML';

  etapas = signal<Etapa[]>([
    {
      nombre: 'Etapa 1: Documentación del Prototipo',
      icono: 'doc',
      subetapas: [
        { nombre: 'Descripción', estado: 'completado' },
        { nombre: 'Diagramas de C.U.', estado: 'completado' },
        { nombre: 'Arquitectura', estado: 'en-revision' },
        { nombre: 'Entidad-Relación', estado: 'pendiente' },
        { nombre: 'Interfaces', estado: 'pendiente' },
      ],
    },
    {
      nombre: 'Etapa 2: Desarrollo del Prototipo',
      icono: 'code',
      subetapas: [
        { nombre: 'Avance 25%', estado: 'pendiente' },
        { nombre: 'Avance 50%', estado: 'pendiente' },
        { nombre: 'Avance 75%', estado: 'pendiente' },
        { nombre: 'Avance 100%', estado: 'pendiente' },
      ],
    },
    {
      nombre: 'Etapa 3: Capítulo 1 Introducción',
      icono: 'book',
      subetapas: [
        { nombre: 'Objetivos', estado: 'pendiente' },
        { nombre: 'Antecedentes', estado: 'pendiente' },
        { nombre: 'Planteamiento del problema', estado: 'pendiente' },
        { nombre: 'Preguntas de investigación', estado: 'pendiente' },
        { nombre: 'Justificación', estado: 'pendiente' },
        { nombre: 'Viabilidad', estado: 'pendiente' },
        { nombre: 'Metodología', estado: 'pendiente' },
      ],
    },
    {
      nombre: 'Etapa 4: Capítulo 2 Marco Teórico',
      icono: 'book',
      subetapas: [
        { nombre: 'Revisión de literatura', estado: 'pendiente' },
        { nombre: 'Desarrollo de conceptos', estado: 'pendiente' },
      ],
    },
  ]);

  expandedEtapa = signal<number>(0);
  selectedEtapa = signal<number>(0);
  selectedSubEtapa = signal<number>(2);

  etapaActual = computed(() => this.etapas()[this.selectedEtapa()]);
  subEtapaActual = computed(() => {
    const etapa = this.etapaActual();
    return etapa?.subetapas[this.selectedSubEtapa()];
  });

  archivoActual = signal<ArchivoSubido | null>({
    nombre: 'arquitectura_sistema_v3.pdf',
    fecha: '13 Mar 2026',
    tamano: '2.4 MB',
  });

  versionesAnteriores = signal<ArchivoSubido[]>([
    { nombre: 'arquitectura_sistema_v2.pdf', fecha: '8 Mar 2026', tamano: '2.1 MB' },
    { nombre: 'arquitectura_sistema_v1.pdf', fecha: '1 Mar 2026', tamano: '1.8 MB' },
  ]);

  revisiones = signal<Revision[]>([
    {
      autor: 'Dr. Luis Hernández',
      iniciales: 'DLH',
      rol: 'Director',
      estado: 'aprobado',
      comentario:
        'Excelente trabajo en los diagramas de caso de uso. La documentación está clara y completa. Aprobado para continuar con la siguiente sección.',
      fecha: '15 Mar 2026 • 14:30',
    },
    {
      autor: 'Dra. Patricia Rojas',
      iniciales: 'DPR',
      rol: 'Codirector',
      estado: 'correcciones',
      comentario:
        'El diagrama de arquitectura necesita más detalle en la capa de servicios. Por favor, incluye información sobre los endpoints de la API REST.',
      fecha: '14 Mar 2026 • 10:15',
    },
  ]);

  toggleEtapa(index: number) {
    this.expandedEtapa.set(this.expandedEtapa() === index ? -1 : index);
  }

  selectSubEtapa(etapaIdx: number, subIdx: number) {
    this.selectedEtapa.set(etapaIdx);
    this.selectedSubEtapa.set(subIdx);
    this.expandedEtapa.set(etapaIdx);
  }

  volverAProyectos() {
    this.router.navigate(['/inicio/proyectos']);
  }
}
