import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Propuesta } from './propuesta.model';
import { PropuestaService } from './propuesta.service';
import { AuthService } from '../auth/auth.service';
import { PostulacionService } from '../postulacion/postulacion.service';

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
  private postulacionService = inject(PostulacionService);

  rol = signal(this.authService.getRol());
  propuestas = signal<Propuesta[]>([]);
  loading = signal(true);
  errorMsg = signal('');

  searchQuery = signal('');
  selectedFilter = signal<'todos' | 'Busco Director' | 'Busco Estudiante'>('todos');
  showFilterDropdown = signal(false);

  propuestasFiltradas = computed(() => {
    let lista = this.propuestas();
    const query = this.searchQuery().toLowerCase().trim();
    const filtro = this.selectedFilter();

    if (filtro !== 'todos') {
      const normalizedFiltro = filtro.replace(' ', '_');
      lista = lista.filter(p => p.tipo === filtro || p.tipo === normalizedFiltro);
    }

    if (query) {
      lista = lista.filter(p =>
        p.titulo.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query) ||
        p.creador?.nombre?.toLowerCase().includes(query) ||
        (p.tecnologias ?? []).some(t => t.toLowerCase().includes(query))
      );
    }

    return lista;
  });
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

    const currentUser = this.currentUser;
    const extractId = (val: any): number | undefined => {
      if (val == null) return undefined;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const n = Number(val);
        return Number.isNaN(n) ? undefined : n;
      }
      if (typeof val === 'object') {
        return extractId(val.id_usuario ?? val.id ?? val.user_id ?? val.usuario_id ?? val.idUser ?? val.id_propuesta);
      }
      return undefined;
    };
    const currentUserId = extractId(currentUser);

    this.propuestaService.getPropuestas().subscribe({
      next: (data) => {
        const propuestasFiltradas = data.filter(p => {
          const isOwnPropuesta = currentUserId !== undefined && p.id_creador === currentUserId;

          if (this.rol() === 'Docente') {
            return p.tipo === 'Busco Director' || isOwnPropuesta;
          } else {
            return p.tipo === 'Busco Estudiante' || isOwnPropuesta;
          }
        });

        this.propuestas.set(propuestasFiltradas);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message ?? 'Error al cargar las propuestas.');
        this.loading.set(false);
      }
    });
  }

  get currentUser() {
    return this.authService.getUser();
  }

  esCreador(p: any): boolean {

    const user = this.currentUser;
    if (!user) return false;

    const extractId = (val: any): number | undefined => {
      if (val == null) return undefined;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const n = Number(val);
        return Number.isNaN(n) ? undefined : n;
      }
      if (typeof val === 'object') {
        return extractId(val.id_usuario ?? val.id ?? val.user_id ?? val.usuario_id ?? val.idUser ?? val.id_propuesta);
      }
      return undefined;
    };

    const currentUserId = extractId(user);
    const creadorId = extractId(p?.creador) ?? extractId(p?.creador_id) ?? extractId(p?.users) ?? extractId(p?.user) ?? extractId(p?.creador_usuario);

    return currentUserId !== undefined && creadorId !== undefined && currentUserId === creadorId;
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
    this.nuevoTipo = this.rol() === 'Docente' ? 'Busco Estudiante' : 'Busco Director';
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
    const p = this.selectedPropuesta();
    if (!p) return;

    const partes: string[] = [];
    if (this.postMotivacion.trim()) partes.push(this.postMotivacion.trim());
    if (this.postExperiencia.trim()) partes.push(`Experiencia: ${this.postExperiencia.trim()}`);

    this.postulacionService.createPostulacion({
      id_propuesta: p.id_propuesta,
      mensaje: partes.join('\n') || 'Interesado en esta propuesta'
    }).subscribe({
      next: () => {
        this.postulacionEnviada.set(true);
        this.cargarPropuestas();
      },
      error: (err) => this.errorMsg.set(err.error?.message ?? 'Error al enviar postulación.')
    });
  }

  getPostulacionesActivas(p: Propuesta): any[] {
    return p.postulaciones?.filter(post => post.estado !== 'rechazada') || [];
  }

  getPostulacionUsuario(p: Propuesta): any | null {
    const user = this.currentUser;
    if (!user || !p.postulaciones) return null;

    const extractId = (val: any): number | undefined => {
      if (val == null) return undefined;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const n = Number(val);
        return Number.isNaN(n) ? undefined : n;
      }
      if (typeof val === 'object') {
        return extractId(val.id_usuario ?? val.id ?? val.user_id ?? val.usuario_id ?? val.idUser);
      }
      return undefined;
    };

    const currentUserId = extractId(user);
    if (currentUserId === undefined) return null;

    const userPosts = p.postulaciones.filter(post => extractId(post.id_usuario ?? post.users?.id_usuario) === currentUserId);
    if (userPosts.length === 0) return null;

    // Prefer accepted postulation if it exists
    const accepted = userPosts.find(post => post.estado === 'aceptada');
    if (accepted) return accepted;

    // Otherwise, return the most recent postulation
    return userPosts.reduce((latest, current) => {
      const currentId = Number(current.id_postulacion) || 0;
      const latestId = Number(latest.id_postulacion) || 0;
      return currentId > latestId ? current : latest;
    }, userPosts[0]);
  }

  aceptarPostulacion(id_postulacion: number) {
    this.postulacionService.cambiarEstado(id_postulacion, 'aceptada').subscribe({
      next: () => {
        const current = this.selectedPropuesta();
        if (current && current.postulaciones) {
          current.postulaciones = current.postulaciones.map(post =>
            post.id_postulacion === id_postulacion ? { ...post, estado: 'aceptada' } : post
          );
          this.selectedPropuesta.set({ ...current });
        }
        this.closeDetalles();
        this.cargarPropuestas();
      },
      error: (err) => this.errorMsg.set(err.error?.message ?? 'Error al aceptar postulación.')
    });
  }

  rechazarPostulacion(id_postulacion: number) {
    this.postulacionService.cambiarEstado(id_postulacion, 'rechazada').subscribe({
      next: () => {
        const current = this.selectedPropuesta();
        if (current && current.postulaciones) {
          current.postulaciones = current.postulaciones.filter(post => post.id_postulacion !== id_postulacion);
          this.selectedPropuesta.set({ ...current });
        }
        this.cargarPropuestas();
      },
      error: (err) => this.errorMsg.set(err.error?.message ?? 'Error al rechazar postulación.')
    });
  }
}
