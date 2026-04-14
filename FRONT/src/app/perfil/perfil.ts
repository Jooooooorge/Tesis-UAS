import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, UserProfile } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private usersService = inject(UsersService);
  private authService = inject(AuthService);

  editMode = signal(false);
  loading = signal(true);

  nombre = '';
  email = '';
  rol = '';
  carrera = '';
  matricula = '';
  telefono = '';
  bio = '';

  propuestasPublicadas = 0;
  proyectosActivos = 0;
  postulacionesEnviadas = 0;

  private backup: any = {};

  ngOnInit() {
    this.usersService.getProfile().subscribe({
      next: (user) => {
        this.setUserData(user);
        this.loading.set(false);
      },
      error: () => {
        const cached = this.authService.getUser();
        if (cached) {
          this.nombre = cached.nombre;
          this.email = cached.email;
          this.rol = cached.rol;
          this.carrera = cached.carrera || '';
          this.matricula = cached.matricula || '';
          this.telefono = cached.telefono || '';
          this.bio = cached.bio || '';
        }
        this.loading.set(false);
      },
    });
  }

  private setUserData(user: UserProfile) {
    this.nombre = user.nombre;
    this.email = user.email;
    this.rol = user.rol;
    this.carrera = user.carrera || '';
    this.matricula = user.matricula || '';
    this.telefono = user.telefono || '';
    this.bio = user.bio || '';
  }

  toggleEdit() {
    if (!this.editMode()) {
      this.backup = {
        nombre: this.nombre,
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
    this.carrera = this.backup.carrera;
    this.matricula = this.backup.matricula;
    this.telefono = this.backup.telefono;
    this.bio = this.backup.bio;
    this.editMode.set(false);
  }

  guardarPerfil() {
    this.usersService
      .updateProfile({
        nombre: this.nombre,
        carrera: this.carrera,
        matricula: this.matricula,
        telefono: this.telefono,
        bio: this.bio,
      })
      .subscribe({
        next: (updated) => {
          this.setUserData(updated);
          this.editMode.set(false);
        },
        error: () => this.cancelEdit(),
      });
  }

  getIniciales(): string {
    return this.nombre
      .split(' ')
      .map((w) => w[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  }
}
