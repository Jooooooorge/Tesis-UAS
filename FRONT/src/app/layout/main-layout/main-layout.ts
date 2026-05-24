import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, LoginResponse } from '../../auth/auth.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificacionesService = inject(NotificacionesService);

  currentUser = signal<LoginResponse['user'] | null>(null);
  unreadCount = signal<number>(0);
  private pollSubscription?: Subscription;

  ngOnInit() {
    this.currentUser.set(this.authService.getUser());
    this.loadUnreadCount();

    // Poll unread count every 15 seconds
    this.pollSubscription = interval(15000).subscribe(() => {
      this.loadUnreadCount();
    });
  }

  ngOnDestroy() {
    this.pollSubscription?.unsubscribe();
  }

  loadUnreadCount() {
    if (this.authService.getToken()) {
      this.notificacionesService.countNoLeidas().subscribe({
        next: (count) => this.unreadCount.set(count),
        error: () => {}
      });
    }
  }

  get esProfesor(): boolean {
    const rol = this.currentUser()?.rol;
    return rol === 'Docente' || rol === 'Profesor' || rol === 'Coordinador';
  }

  get esEstudiante(): boolean {
    return this.currentUser()?.rol === 'Estudiante';
  }

  logout() {
    this.authService.logout();
  }
}

