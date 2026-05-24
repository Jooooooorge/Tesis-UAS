import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Proyecto } from './proyecto.model';
import { ProyectoService } from './proyecto.service';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.css',
})
export class Proyectos implements OnInit {
  private router = inject(Router);
  private proyectoService = inject(ProyectoService);

  loading = signal(true);
  proyectos = signal<Proyecto[]>([]);

  ngOnInit() {
    this.proyectoService.getProyectos().subscribe({
      next: (data) => {
        this.proyectos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching proyectos:', err);
        this.loading.set(false);
      }
    });
  }

  abrirProyecto(id: number) {
    this.router.navigate(['/inicio/proyectos', id]);
  }
}
