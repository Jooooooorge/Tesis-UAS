import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bandeja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bandeja.html',
  styleUrls: ['./bandeja.css']
})
export class Bandeja implements OnInit {
  loading = signal(true);
  mensajes = signal<any[]>([]);

  ngOnInit() {
    this.cargarMensajes();
  }

  private cargarMensajes() {
    this.loading.set(false);
  }

  unreadCount() {
    return this.mensajes().filter(m => !m.leido).length;
  }

  marcarLeido(id: number) {
    this.mensajes.update(list =>
      list.map(m => m.id === id ? { ...m, leido: true } : m)
    );
  }
}
