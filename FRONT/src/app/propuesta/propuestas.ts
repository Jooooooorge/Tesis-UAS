import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Propuesta } from './propuesta.model';

@Component({
  selector: 'app-propuestas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './propuestas.html',
  styleUrl: './propuestas.css',
})
export class Propuestas {
  // Simulated current user (TODO: replace with real auth service)
  currentUser = signal({ id: 100, nombre: 'María García', rol: 'Estudiante' as 'Estudiante' | 'Docente' | 'Coordinador' | 'Admin' });

  searchQuery = '';
  showModal = signal(false);
  selectedPropuesta = signal<Propuesta | null>(null);
  editingPropuesta = signal<Propuesta | null>(null);
  showDeleteConfirm = signal<Propuesta | null>(null);
  showPostulacion = signal(false);

  // Postulation form
  postNombre = '';
  postEmail = '';
  postMotivacion = '';
  postExperiencia = '';
  postulacionEnviada = signal(false);

  // Permissions
  esCreador(p: Propuesta): boolean {
    return p.creadorId === this.currentUser().id;
  }

  esAdmin(): boolean {
    return this.currentUser().rol === 'Admin';
  }

  puedeEditar(p: Propuesta): boolean {
    return this.esCreador(p);
  }

  puedeEliminar(p: Propuesta): boolean {
    return this.esCreador(p) || this.esAdmin();
  }

  verDetalles(p: Propuesta) {
    this.selectedPropuesta.set(p);
    this.showPostulacion.set(false);
    this.postulacionEnviada.set(false);
  }

  closeDetalles() {
    this.selectedPropuesta.set(null);
    this.showPostulacion.set(false);
    this.postulacionEnviada.set(false);
  }

  // New propuesta form
  nuevoTitulo = '';
  nuevoDescripcion = '';
  nuevoTipo: 'Busco Director' | 'Busco Estudiante' = 'Busco Director';
  nuevoTecnologias = '';
  nuevoAutor = '';

  openModal() {
    this.editingPropuesta.set(null);
    this.nuevoTitulo = '';
    this.nuevoDescripcion = '';
    this.nuevoTipo = 'Busco Director';
    this.nuevoTecnologias = '';
    this.nuevoAutor = this.currentUser().nombre;
    this.showModal.set(true);
  }

  openEditModal(p: Propuesta) {
    this.editingPropuesta.set(p);
    this.nuevoTitulo = p.titulo;
    this.nuevoDescripcion = p.descripcion;
    this.nuevoTipo = p.tipo;
    this.nuevoTecnologias = p.tecnologias.join(', ');
    this.nuevoAutor = p.autor;
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPropuesta.set(null);
  }

  crearPropuesta() {
    if (!this.nuevoTitulo || !this.nuevoDescripcion || !this.nuevoAutor) return;

    const iniciales = this.nuevoAutor
      .split(' ')
      .map((w) => w[0]?.toUpperCase())
      .join('')
      .slice(0, 3);

    const tags = this.nuevoTecnologias
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const editing = this.editingPropuesta();

    if (editing) {
      // Update existing
      this.propuestas.update((list) =>
        list.map((item) =>
          item.id === editing.id
            ? { ...item, titulo: this.nuevoTitulo, descripcion: this.nuevoDescripcion, tipo: this.nuevoTipo, tecnologias: tags, autor: this.nuevoAutor, iniciales }
            : item
        )
      );
    } else {
      // Create new
      const nueva: Propuesta = {
        id: Date.now(),
        titulo: this.nuevoTitulo,
        descripcion: this.nuevoDescripcion,
        tipo: this.nuevoTipo,
        tecnologias: tags,
        autor: this.nuevoAutor,
        iniciales,
        tiempoPublicacion: 'Justo ahora',
        creadorId: this.currentUser().id,
      };
      this.propuestas.update((list) => [nueva, ...list]);
    }

    this.closeModal();
  }

  // Delete
  confirmDelete(p: Propuesta) {
    this.showDeleteConfirm.set(p);
  }

  cancelDelete() {
    this.showDeleteConfirm.set(null);
  }

  eliminarPropuesta() {
    const p = this.showDeleteConfirm();
    if (!p) return;
    this.propuestas.update((list) => list.filter((item) => item.id !== p.id));
    this.showDeleteConfirm.set(null);
    // Close detail modal if it was showing this propuesta
    if (this.selectedPropuesta()?.id === p.id) {
      this.closeDetalles();
    }
  }

  // Postulation
  openPostulacion() {
    this.postNombre = this.currentUser().nombre;
    this.postEmail = '';
    this.postMotivacion = '';
    this.postExperiencia = '';
    this.postulacionEnviada.set(false);
    this.showPostulacion.set(true);
  }

  enviarPostulacion() {
    if (!this.postNombre || !this.postEmail || !this.postMotivacion) return;
    // TODO: send to backend
    this.postulacionEnviada.set(true);
  }

  propuestas = signal<Propuesta[]>([
    {
      id: 1,
      titulo: 'Sistema de Gestión de Inventario con ML',
      descripcion:
        'Desarrollo de un sistema de inventario inteligente que utiliza machine learning para predecir demanda, optimizar stock y automatizar pedidos basándose en patrones históricos de compra.',
      tipo: 'Busco Director',
      tecnologias: ['React', 'Python', 'Machine Learning', 'PostgreSQL'],
      autor: 'María García',
      iniciales: 'MG',
      tiempoPublicacion: 'Hace 2 días',
      creadorId: 100,
    },
    {
      id: 2,
      titulo: 'Aplicación Móvil para Monitoreo de Salud',
      descripcion:
        'Busco estudiante para desarrollar app móvil de seguimiento de parámetros de salud con integración de dispositivos IoT para monitoreo en tiempo real.',
      tipo: 'Busco Estudiante',
      tecnologias: ['React Native', 'IoT', 'Firebase', 'Node.js'],
      autor: 'Dr. Carlos Mendoza',
      iniciales: 'DCM',
      tiempoPublicacion: 'Hace 5 días',
      creadorId: 200,
    },
    {
      id: 3,
      titulo: 'Plataforma de E-Learning con Gamificación',
      descripcion:
        'Plataforma educativa con elementos de gamificación para mejorar el engagement de los estudiantes en cursos universitarios.',
      tipo: 'Busco Director',
      tecnologias: ['Vue.js', 'Django', 'MongoDB', 'WebSockets'],
      autor: 'Ana Martínez',
      iniciales: 'AM',
      tiempoPublicacion: 'Hace 1 semana',
      creadorId: 300,
    },
    {
      id: 4,
      titulo: 'Blockchain para Trazabilidad de Cadena de Suministro',
      descripcion:
        'Implementación de blockchain para rastrear productos en toda la cadena de suministro con transparencia y seguridad garantizada.',
      tipo: 'Busco Estudiante',
      tecnologias: ['Solidity', 'Ethereum', 'Node.js', 'React'],
      autor: 'Dr. Roberto Flores',
      iniciales: 'DRF',
      tiempoPublicacion: 'Hace 1 semana',
      creadorId: 400,
    },
    {
      id: 5,
      titulo: 'Sistema de Reconocimiento Facial para Seguridad',
      descripcion:
        'Sistema de reconocimiento facial en tiempo real para control de acceso y seguridad en instalaciones universitarias.',
      tipo: 'Busco Director',
      tecnologias: ['Python', 'OpenCV', 'TensorFlow', 'Flask'],
      autor: 'Luis Hernández',
      iniciales: 'LH',
      tiempoPublicacion: 'Hace 2 semanas',
      creadorId: 500,
    },
    {
      id: 6,
      titulo: 'Chatbot Inteligente para Atención al Cliente',
      descripcion:
        'Desarrollo de chatbot con procesamiento de lenguaje natural para automatizar atención al cliente en instituciones educativas.',
      tipo: 'Busco Estudiante',
      tecnologias: ['Python', 'NLP', 'FastAPI', 'React'],
      autor: 'Dra. Patricia López',
      iniciales: 'DPL',
      tiempoPublicacion: 'Hace 2 semanas',
      creadorId: 600,
    },
  ]);
}
