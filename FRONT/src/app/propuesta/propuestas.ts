import { Component, signal, computed, OnInit, inject } from '@angular/core';
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

  // Real user from auth service
  currentUser = signal(this.authService.getUser() || { id: 0, nombre: 'Invitado', rol: 'Estudiante' });

  propuestas = signal<Propuesta[]>([]);

  ngOnInit() {
    this.cargarPropuestas();
  }

  cargarPropuestas() {
    this.propuestaService.getPropuestas().subscribe({
      next: (data) => this.propuestas.set(data),
      error: (err) => console.error('Error al cargar propuestas', err)
    });
  }

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

    const tags = this.nuevoTecnologias
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const editing = this.editingPropuesta();

    if (editing) {
      // Update existing
      this.propuestaService.updatePropuesta(editing.id, {
        titulo: this.nuevoTitulo,
        descripcion: this.nuevoDescripcion,
        tipo: this.nuevoTipo,
        tecnologias: tags,
        autor: this.nuevoAutor
      }).subscribe({
        next: () => {
          this.cargarPropuestas();
          this.closeModal();
        },
        error: (err) => console.error('Error al actualizar propuesta', err)
      });
    } else {
      // Create new
      this.propuestaService.createPropuesta({
        titulo: this.nuevoTitulo,
        descripcion: this.nuevoDescripcion,
        tipo: this.nuevoTipo,
        tecnologias: tags,
        autor: this.nuevoAutor,
        creadorId: this.currentUser().id,
      }).subscribe({
        next: () => {
          this.cargarPropuestas();
          this.closeModal();
        },
        error: (err) => console.error('Error al crear propuesta', err)
      });
    }
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
    
    this.propuestaService.deletePropuesta(p.id).subscribe({
      next: () => {
        this.cargarPropuestas();
        this.showDeleteConfirm.set(null);
        if (this.selectedPropuesta()?.id === p.id) {
          this.closeDetalles();
        }
      },
      error: (err) => console.error('Error al eliminar propuesta', err)
    });
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

}
