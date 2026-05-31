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
  bloqueado?: boolean;
  esDocumentoCompleto?: boolean;
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
  isUploading = signal<boolean>(false);
  isGenerating = signal<boolean>(false);

  // Grading state
  evaluacionEstado = signal<'aceptada' | 'requiere_cambios'>('aceptada');
  evaluacionComentario = signal<string>('');

  etapasBase = [
    {
      nombre: 'Etapa 1: Documentación del Prototipo',
      icono: 'doc',
      subetapas: [
        { nombre: 'Descripción' },
        { nombre: 'Diagramas de C.U.' },
        { nombre: 'Arquitectura' },
        { nombre: 'Entidad-Relación' },
        { nombre: 'Interfaces' },
        { nombre: 'Documento completo', esDocumentoCompleto: true },
      ],
    },
    {
      nombre: 'Etapa 2: Desarrollo del Prototipo',
      icono: 'code',
      subetapas: [
        { nombre: 'Avance 25%' },
        { nombre: 'Avance 50%' },
        { nombre: 'Avance 75%' },
        { nombre: 'Avance 100%' },
      ],
    },
    {
      nombre: 'Etapa 3: Capítulo 1 Introducción',
      icono: 'book',
      subetapas: [
        { nombre: 'Objetivos' },
        { nombre: 'Antecedentes' },
        { nombre: 'Planteamiento del problema' },
        { nombre: 'Preguntas de investigación' },
        { nombre: 'Justificación' },
        { nombre: 'Viabilidad' },
        { nombre: 'Metodología' },
        { nombre: 'Documento completo', esDocumentoCompleto: true },
      ],
    },
    {
      nombre: 'Etapa 4: Capítulo 2 Marco Teórico',
      icono: 'book',
      subetapas: [
        { nombre: 'Revisión de literatura' },
        { nombre: 'Desarrollo de conceptos' },
        { nombre: 'Documento completo', esDocumentoCompleto: true },
      ],
    },
  ];

  etapas = computed<Etapa[]>(() => {
    const p = this.proyecto();
    if (!p) return [];

    return this.etapasBase.map((etapa) => {
      const subetapas = etapa.subetapas.map((sub) => {
        const revision = p.revisiones?.find((r: any) => r.tipo === sub.nombre);
        let estado: 'completado' | 'en-revision' | 'pendiente' = 'pendiente';
        if (revision) {
          if (revision.estado === 'aceptada') estado = 'completado';
          else if (revision.estado === 'pendiente') estado = 'en-revision';
        }
        return {
          nombre: sub.nombre,
          estado,
          esDocumentoCompleto: sub.esDocumentoCompleto,
          bloqueado: false,
        } as SubEtapa;
      });

      const documentoCompleto = subetapas.find((s: SubEtapa) => s.esDocumentoCompleto);
      if (documentoCompleto) {
        const bloqueado = subetapas
          .filter((s) => !s.esDocumentoCompleto)
          .some((s) => s.estado !== 'completado');
        documentoCompleto.bloqueado = bloqueado;
      }

      return {
        nombre: etapa.nombre,
        icono: etapa.icono,
        subetapas,
      };
    });
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
      tamano: 'Desconocido',
    };
  });

  versionesAnteriores = computed(() => {
    const revs = this.revisionesActuales();
    if (revs.length <= 1) return [];
    return revs.slice(1).map((r: any) => ({
      nombre: r.documento_path.split('/').pop(),
      fecha: new Date(r.fecha).toLocaleDateString(),
      tamano: 'Desconocido',
      url: `http://localhost:3000${r.documento_path}`,
    }));
  });

  ngOnInit() {
    const user = this.authService.getUser();
    this.isDocente.set(user ? user.rol === 'Docente' : false);

    this.route.paramMap.subscribe((params) => {
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
          data.revisiones.sort(
            (a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
          );
        }
        this.proyecto.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  toggleEtapa(index: number) {
    this.expandedEtapa.set(this.expandedEtapa() === index ? -1 : index);
  }

  selectSubEtapa(etapaIdx: number, subIdx: number) {
    const etapa = this.etapas()[etapaIdx];
    const sub = etapa?.subetapas[subIdx];
    if (sub?.bloqueado) return;

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

    this.isUploading.set(true);
    this.proyectoService.uploadFile(p.id, sub.nombre, file).subscribe({
      next: () => {
        this.selectedFile.set(null);
        this.loadProyecto(p.id);
        this.isUploading.set(false);
      },
      error: (err) => {
        console.error('Error subiendo archivo', err);
        this.isUploading.set(false);
      },
    });
  }

  generarDocumentoCompleto() {
    const p = this.proyecto();
    const sub = this.subEtapaActual();
    const etapa = this.etapaActual();
    if (!p || !sub || !etapa || !sub.esDocumentoCompleto || sub.bloqueado) return;

    this.isGenerating.set(true);
    this.proyectoService.generarDocumentoCompleto(p.id, etapa.nombre).subscribe({
      next: (pdfBlob: Blob) => {
        // Detectar si el servidor devolvió JSON en lugar de PDF
        if (pdfBlob.type === 'application/json') {
          pdfBlob.text().then((text) => {
            try {
              const errorData = JSON.parse(text);
              console.error('Error del servidor:', errorData);
              alert(
                `Error al generar documento: ${errorData.error || errorData.message || 'Error desconocido del servidor'}`
              );
            } catch {
              console.error('Respuesta inválida:', text);
              alert('El servidor devolvió una respuesta inválida (JSON en lugar de PDF)');
            }
            this.isGenerating.set(false);
          });
          return;
        }

        // Validar que sea un PDF válido
        if (!pdfBlob || pdfBlob.size === 0) {
          console.error('El PDF generado está vacío o es inválido');
          alert('El PDF generado está vacío');
          this.isGenerating.set(false);
          return;
        }

        // Verificar el magic number del PDF
        const reader = new FileReader();
        reader.onload = () => {
          const array = new Uint8Array(reader.result as ArrayBuffer);
          const header = String.fromCharCode(array[0], array[1], array[2], array[3]);

          if (header !== '%PDF') {
            console.error('No es un PDF válido. Header:', header);
            alert('El archivo generado no es un PDF válido');
            this.isGenerating.set(false);
            return;
          }

          this.descargarPDF(pdfBlob, p.id);
        };
        reader.readAsArrayBuffer(pdfBlob);
      },
      error: (err) => {
        console.error('Error generando documento completo', err);
        alert(`Error en la solicitud: ${err.message || err.statusText}`);
        this.isGenerating.set(false);
      },
    });
  }

  private descargarPDF(pdfBlob: Blob, proyectoId: number) {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `documento-completo-${proyectoId}-${Date.now()}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
      this.isGenerating.set(false);
    }, 100);
  }

  enviarEvaluacion() {
    const revs = this.revisionesActuales();
    const p = this.proyecto();
    if (revs.length === 0 || !p) return;

    const latest = revs[0] as any;

    // Send evaluation to backend
    this.proyectoService
      .evaluarRevision(latest.id_revision, this.evaluacionEstado(), this.evaluacionComentario())
      .subscribe({
        next: () => {
          // Also we would normally send the message via the Mensajes or Notificaciones system
          // But the backend automatically creates a notification!
          this.loadProyecto(p.id);
        },
        error: (err) => console.error('Error evaluando', err),
      });
  }
}
