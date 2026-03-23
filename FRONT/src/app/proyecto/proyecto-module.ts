import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./proyectos').then((m) => m.Proyectos),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./proyecto-detalle/proyecto-detalle').then((m) => m.ProyectoDetalle),
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ProyectoModule {}
