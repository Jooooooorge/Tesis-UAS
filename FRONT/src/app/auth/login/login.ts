import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService);

  activeTab = signal<'login' | 'register' | 'forgot'>('login');
  email = '';
  password = '';
  rememberMe = false;

  fullName = '';
  registerEmail = '';
  role = 'Estudiante';
  registerPassword = '';
  confirmPassword = '';

  forgotEmail = '';
  resetSent = signal(false);

  loading = signal(false);
  error = signal('');

  switchTab(tab: 'login' | 'register' | 'forgot') {
    this.activeTab.set(tab);
    this.resetSent.set(false);
    this.error.set('');
  }

  onSubmit() {
    this.loading.set(true);
    this.error.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(this.translateError(err.error?.message, 'Error al iniciar sesión'));
      },
    });
  }

  onRegister() {
    if (this.registerPassword !== this.confirmPassword) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService
      .register({
        nombre: this.fullName,
        email: this.registerEmail,
        password: this.registerPassword,
        rol: this.role,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.authService
            .login({ email: this.registerEmail, password: this.registerPassword })
            .subscribe({
              next: () => this.router.navigate(['/inicio']),
              error: () => {
                this.activeTab.set('login');
                this.email = this.registerEmail;
              },
            });
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(this.translateError(err.error?.message, 'Error al crear cuenta'));
        },
      });
  }

  onForgotPassword() {
    this.resetSent.set(true);
  }

  private translateError(message: string | undefined, fallback: string): string {
    if (!message) return fallback;

    const errorMap: Record<string, string> = {
      // Auth
      'Unauthorized': 'No autorizado. Verifica tus credenciales.',
      'Invalid credentials': 'Correo o contraseña incorrectos.',
      'Invalid email or password': 'Correo o contraseña incorrectos.',
      'Wrong credentials': 'Correo o contraseña incorrectos.',
      'User not found': 'No existe una cuenta con ese correo.',
      'Email already exists': 'Ya existe una cuenta registrada con ese correo.',
      'Email already in use': 'Ya existe una cuenta registrada con ese correo.',
      'Password is too short': 'La contraseña es demasiado corta.',
      'Password must be at least 8 characters': 'La contraseña debe tener al menos 8 caracteres.',
      'Invalid email': 'El formato del correo no es válido.',
      'Email is required': 'El correo es obligatorio.',
      'Password is required': 'La contraseña es obligatoria.',
      // Generic HTTP
      'Internal server error': 'Error interno del servidor. Inténtalo más tarde.',
      'Bad Request': 'Solicitud inválida.',
      'Forbidden': 'No tienes permiso para realizar esta acción.',
      'Not Found': 'Recurso no encontrado.',
      'Too Many Requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
      'Service Unavailable': 'Servicio no disponible. Inténtalo más tarde.',
    };

    // Exact match
    if (errorMap[message]) return errorMap[message];

    // Case-insensitive partial match
    const lower = message.toLowerCase();
    for (const [key, value] of Object.entries(errorMap)) {
      if (lower.includes(key.toLowerCase())) return value;
    }

    return fallback;
  }
}
