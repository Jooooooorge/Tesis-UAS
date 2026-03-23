import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  editMode = signal(false);

  // Profile data
  nombre = 'María García';
  email = 'maria.garcia@universidad.edu';
  rol = 'Estudiante';
  carrera = 'Ingeniería en Sistemas Computacionales';
  matricula = '20210001';
  telefono = '+52 612 123 4567';
  bio = 'Estudiante de último semestre interesada en machine learning y desarrollo web. Buscando director de tesis para proyecto de sistema de gestión de inventario con ML.';

  // Stats
  propuestasPublicadas = 1;
  proyectosActivos = 2;
  postulacionesEnviadas = 3;

  // Backup for cancel
  private backup: any = {};

  toggleEdit() {
    if (!this.editMode()) {
      this.backup = {
        nombre: this.nombre,
        email: this.email,
        carrera: this.carrera,
        matricula: this.matricula,
        telefono: this.telefono,
        bio: this.bio,
      };
    }
    this.editMode.set(!this.editMode());
  }

  cancelEdit() {
    this.nombre = this.backup.nombre;
    this.email = this.backup.email;
    this.carrera = this.backup.carrera;
    this.matricula = this.backup.matricula;
    this.telefono = this.backup.telefono;
    this.bio = this.backup.bio;
    this.editMode.set(false);
  }

  guardarPerfil() {
    // TODO: save to backend
    this.editMode.set(false);
  }

  getIniciales(): string {
    return this.nombre
      .split(' ')
      .map((w) => w[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  }
}
