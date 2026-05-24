import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-revisiones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revisiones.html',
  styleUrls: ['./revisiones.css']
})
export class Revisiones implements OnInit {
  constructor(private router: Router) {}

  loading = signal(true);
  revisiones = signal<any[]>([]);

  ngOnInit() {
    this.cargarRevisiones();
  }

  private cargarRevisiones() {
    this.loading.set(false);
  }

  verDetalle(id: number) {
    // Navigate to project detail
    this.router.navigate(['/inicio/proyectos']);
  }

  aprobar(id: number) {
    this.revisiones.update(list => list.filter(r => r.id !== id));
  }
}
