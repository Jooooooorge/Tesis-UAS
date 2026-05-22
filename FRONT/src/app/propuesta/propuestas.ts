import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Propuesta } from './propuesta.model';
import { PropuestaService } from './propuesta.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-propuestas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './propuestas.html',
  styleUrl: './propuestas.css',
})
export class Propuestas implements OnInit {
  private propuestaService = inject(PropuestaService);
  private authService = inject(AuthService);

  rol = signal(this.authService.getRol());
  propuestas = signal<Propuesta[]>([]);
  loading = signal(true);
  errorMsg = signal('');

  searchQuery = '';
  showModal = signal(false);
  selectedPropuesta = signal<Propuesta | null>(null);
  editingPropuesta = signal<Propuesta | null>(null);
  showDeleteConfirm = signal<Propuesta | null>(null);
  showPostulacion = signal(false);

  postNombre = '';
  postEmail = '';
  postMotivacion = '';
  postExperiencia = '';
  postulacionEnviada = signal(false);

  nuevoTitulo = '';
  nuevoDescripcion = '';
  nuevoTipo: 'Busco Director' | 'Busco Estudiante' = 'Busco Director';
  nuevoTecnologias = '';

  ngOnInit() {
    this.cargarPropuestas();
  }

  cargarPropuestas() {
    this.loading.set(true);
    this.errorMsg.set('');

    if (this.rol() === 'Docente') {
      this.propuestaService.getPropuestasDocente().subscribe({
        next: (data) => { this.propuestas.set(data); this.loading.set(false); },
        error: (err) => { this.errorMsg.set(err.error?.message ?? 'Error al cargar las propuestas.'); this.loading.set(false); }
      });
    } else {
      this.propuestaService.getPropuestasAlumno().subscribe({
        next: (data) => { this.propuestas.set(data); this.loading.set(false); },
        error: (err) => { this.errorMsg.set(err.error?.message ?? 'Error al cargar las propuestas.'); this.loading.set(false); }
      });
    }
  }

  get currentUser() {
    return this.authService.getUser();
  }

  esCreador(p: any): boolean {
    if (!this.currentUser) return false;
    
    // Check various possible ID field names depending on backend mapping
    const currentUserId = this.currentUser.id || this.currentUser.id_usuario;
    const creadorId = p.creador?.id || p.creador?.id_usuario || p.creador_id || p.users?.id;
    
    return currentUserId !== undefined && creadorId === currentUserId;
  }

  puedeEditar(p: Propuesta): boolean {
    return this.esCreador(p);
  }

  puedeEliminar(p: Propuesta): boolean {
    return this.esCreador(p);
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

  openModal() {
    this.editingPropuesta.set(null);
    this.nuevoTitulo = '';
    this.nuevoDescripcion = '';
    this.nuevoTipo = 'Busco Director';
    this.nuevoTecnologias = '';
    this.showModal.set(true);
  }

  openEditModal(p: Propuesta) {
    this.editingPropuesta.set(p);
    this.nuevoTitulo = p.titulo;
    this.nuevoDescripcion = p.descripcion;
    this.nuevoTipo = p.tipo;
    this.nuevoTecnologias = p.tecnologias?.join(', ') || '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPropuesta.set(null);
  }

  crearPropuesta() {
    if (!this.nuevoTitulo || !this.nuevoDescripcion) return;

    const tags = this.nuevoTecnologias.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
    const editing = this.editingPropuesta();

    if (editing) {
      this.propuestaService.updatePropuesta(editing.id_propuesta, {
        titulo: this.nuevoTitulo,
        descripcion: this.nuevoDescripcion,
        tipo: this.nuevoTipo,
        tecnologias: tags,
        creador: editing.creador
      }).subscribe({
        next: () => { this.cargarPropuestas(); this.closeModal(); },
        error: (err) => this.errorMsg.set(err.error?.message ?? 'Error al actualizar la propuesta.')
      });
    } else {
      this.propuestaService.createPropuesta({
        titulo: this.nuevoTitulo,
        descripcion: this.nuevoDescripcion,
        tipo: this.nuevoTipo,
        tecnologias: tags
      }).subscribe({
        next: () => { this.cargarPropuestas(); this.closeModal(); },
        error: (err) => this.errorMsg.set(err.error?.message ?? 'Error al crear la propuesta.')
      });
    }
  }

  confirmDelete(p: Propuesta) {
    this.showDeleteConfirm.set(p);
  }

  cancelDelete() {
    this.showDeleteConfirm.set(null);
  }

  eliminarPropuesta() {
    const p = this.showDeleteConfirm();
    if (!p) return;
    this.propuestaService.deletePropuesta(p.id_propuesta).subscribe({
      next: () => {
        this.cargarPropuestas();
        this.showDeleteConfirm.set(null);
        if (this.selectedPropuesta()?.id_propuesta === p.id_propuesta) this.closeDetalles();
      },
      error: (err) => this.errorMsg.set(err.error?.message ?? 'Error al eliminar la propuesta.')
    });
  }

  openPostulacion() {
    this.postNombre = this.currentUser?.nombre || '';
    this.postEmail = '';
    this.postMotivacion = '';
    this.postExperiencia = '';
    this.postulacionEnviada.set(false);
    this.showPostulacion.set(true);
  }

  enviarPostulacion() {
    if (!this.postMotivacion) return;
    this.postulacionEnviada.set(true);
  }
}
