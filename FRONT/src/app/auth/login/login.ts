import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);

  activeTab = signal<'login' | 'register' | 'forgot'>('login');
  email = '';
  password = '';
  rememberMe = false;

  // Register fields
  fullName = '';
  registerEmail = '';
  role = 'Estudiante';
  registerPassword = '';
  confirmPassword = '';

  // Forgot password fields
  forgotEmail = '';
  resetSent = signal(false);

  switchTab(tab: 'login' | 'register' | 'forgot') {
    this.activeTab.set(tab);
    this.resetSent.set(false);
  }

  onSubmit() {
    // TODO: implement real login logic
    this.router.navigate(['/inicio']);
  }

  onRegister() {
    // TODO: implement real register logic
    this.router.navigate(['/inicio']);
  }

  onForgotPassword() {
    // TODO: implement real password recovery
    this.resetSent.set(true);
  }
}
