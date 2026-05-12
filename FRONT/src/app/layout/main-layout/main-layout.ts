import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, LoginResponse } from '../../auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  private authService = inject(AuthService);
  currentUser = signal<LoginResponse['user'] | null>(null);

  ngOnInit() {
    this.currentUser.set(this.authService.getUser());
  }

  get esProfesor(): boolean {
    const rol = this.currentUser()?.rol;
    return rol === 'Docente' || rol === 'Profesor' || rol === 'Coordinador';
  }

  logout() {
    this.authService.logout();
  }
}

