import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProyectoService } from '../proyecto.service';
import { AuthService } from '../../auth/auth.service';
import { Proyecto } from '../proyecto.model';

interface SubEtapa {
  nombre: string;
  estado: 'completado' | 'en-revision' | 'pendiente';
}

interface Etapa {
  nombre: string;
  icono: string;
  subetapas: SubEtapa[];
}

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proyecto-detalle.html',
  styleUrl: './proyecto-detalle.css',
})
export class ProyectoDetalle implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private proyectoService = inject(ProyectoService);
  private authService = inject(AuthService);

  proyecto = signal<Proyecto | null>(null);
  proyectoTitulo = 'Cargando proyecto...';
  isDocente = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  // File upload state
  selectedFile = signal<File | null>(null);
  
  // Grading state
  evaluacionEstado = signal<'aceptada' | 'requiere_cambios'>('aceptada');
  evaluacionComentario = signal<string>('');

  etapasBase = [
    {
      nombre: 'Etapa 1: Documentación del Prototipo',
      icono: 'doc',
      subetapas: ['Descripción', 'Diagramas de C.U.', 'Arquitectura', 'Entidad-Relación', 'Interfaces'],
    },
    {
      nombre: 'Etapa 2: Desarrollo del Prototipo',
      icono: 'code',
      subetapas: ['Avance 25%', 'Avance 50%', 'Avance 75%', 'Avance 100%'],
    },
    {
      nombre: 'Etapa 3: Capítulo 1 Introducción',
      icono: 'book',
      subetapas: ['Objetivos', 'Antecedentes', 'Planteamiento del problema', 'Preguntas de investigación', 'Justificación', 'Viabilidad', 'Metodología'],
    },
    {
      nombre: 'Etapa 4: Capítulo 2 Marco Teórico',
      icono: 'book',
      subetapas: ['Revisión de literatura', 'Desarrollo de conceptos'],
    },
  ];

  etapas = computed<Etapa[]>(() => {
    const p = this.proyecto();
    if (!p) return [];

    return this.etapasBase.map(etapa => ({
      nombre: etapa.nombre,
      icono: etapa.icono,
      subetapas: etapa.subetapas.map(nombre => {
        // Find latest revision for this subetapa
        const revision = p.revisiones?.find((r: any) => r.tipo === nombre);
        let estado: 'completado' | 'en-revision' | 'pendiente' = 'pendiente';
        if (revision) {
          if (revision.estado === 'aceptada') estado = 'completado';
          else if (revision.estado === 'pendiente') estado = 'en-revision';
          // requiere_cambios = pendiente essentially
        }
        return { nombre, estado };
      })
    }));
  });

  expandedEtapa = signal<number>(0);
  selectedEtapa = signal<number>(0);
  selectedSubEtapa = signal<number>(2);

  etapaActual = computed(() => this.etapas()[this.selectedEtapa()]);
  subEtapaActual = computed(() => {
    const etapa = this.etapaActual();
    return etapa?.subetapas[this.selectedSubEtapa()];
  });

  revisionesActuales = computed(() => {
    const p = this.proyecto();
    const sub = this.subEtapaActual();
    if (!p || !sub || !p.revisiones) return [];
    return p.revisiones.filter((r: any) => r.tipo === sub.nombre);
  });

  archivoActual = computed(() => {
    const revs = this.revisionesActuales();
    if (revs.length === 0) return null;
    const latest = revs[0] as any;
    return {
      id: latest.id_revision,
      nombre: latest.documento_path.split('/').pop(),
      fecha: new Date(latest.fecha).toLocaleDateString(),
      url: `http://localhost:3000${latest.documento_path}`,
      estado: latest.estado,
      tamano: 'Desconocido'
    };
  });

  versionesAnteriores = computed(() => {
    const revs = this.revisionesActuales();
    if (revs.length <= 1) return [];
    return revs.slice(1).map((r: any) => ({
      nombre: r.documento_path.split('/').pop(),
      fecha: new Date(r.fecha).toLocaleDateString(),
      tamano: 'Desconocido',
      url: `http://localhost:3000${r.documento_path}`
    }));
  });

  ngOnInit() {
    const user = this.authService.getUser();
    this.isDocente.set(user ? user.rol === 'Docente' : false);

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProyecto(id);
      }
    });
  }

  loadProyecto(id: number) {
    this.isLoading.set(true);
    this.proyectoService.getProyectoById(id).subscribe({
      next: (data) => {
        // Sort revisiones by date descending just in case
        if (data.revisiones) {
          data.revisiones.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        }
        this.proyecto.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleEtapa(index: number) {
    this.expandedEtapa.set(this.expandedEtapa() === index ? -1 : index);
  }

  selectSubEtapa(etapaIdx: number, subIdx: number) {
    this.selectedEtapa.set(etapaIdx);
    this.selectedSubEtapa.set(subIdx);
    this.expandedEtapa.set(etapaIdx);
    this.selectedFile.set(null);
    this.evaluacionComentario.set('');
  }

  volverAProyectos() {
    this.router.navigate(['/inicio/proyectos']);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  subirArchivo() {
    const file = this.selectedFile();
    const p = this.proyecto();
    const sub = this.subEtapaActual();
    if (!file || !p || !sub) return;

    this.proyectoService.uploadFile(p.id, sub.nombre, file).subscribe({
      next: () => {
        this.selectedFile.set(null);
        this.loadProyecto(p.id);
      },
      error: (err) => console.error('Error subiendo archivo', err)
    });
  }

  enviarEvaluacion() {
    const revs = this.revisionesActuales();
    const p = this.proyecto();
    if (revs.length === 0 || !p) return;
    
    const latest = revs[0] as any;
    
    // Send evaluation to backend
    this.proyectoService.evaluarRevision(latest.id_revision, this.evaluacionEstado(), this.evaluacionComentario()).subscribe({
      next: () => {
        // Also we would normally send the message via the Mensajes or Notificaciones system
        // But the backend automatically creates a notification! 
        this.loadProyecto(p.id);
      },
      error: (err) => console.error('Error evaluando', err)
    });
  }
}
