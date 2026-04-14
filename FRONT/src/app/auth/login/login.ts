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
        this.error.set(err.error?.message || 'Error al iniciar sesión');
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
          this.error.set(err.error?.message || 'Error al crear cuenta');
        },
      });
  }

  onForgotPassword() {
    this.resetSent.set(true);
  }
}
