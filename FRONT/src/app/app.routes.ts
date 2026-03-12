import { Routes } from '@angular/router';

export const routes: Routes = [];
// ======= EJEMPLO ==========
// import { Routes } from '@angular/router';
// import { MainLayout } from './layout/main-layout/main-layout';

// export const routes: Routes = [
//   {
//     path: 'auth',
//     loadChildren: () => import('./auth/auth-module').then((a) => a.AuthModule),
//   },
//   {
//     path: '',
//     loadChildren: () => import('./landing/landing-module').then((m) => m.LandingModule),
//   },
//   {
//     path: 'inicio',
//     component: MainLayout,
//     children: [
//       {
//         path: '',
//         loadComponent: () => import('./home/home').then((m) => m.Home),
//       },
//       {
//         path: 'proyectos',
//         loadChildren: () => import('./proyecto/proyecto-module').then((m) => m.ProyectoModule),
//       },
//       {
//         path: 'colaboradores',
//         loadChildren: () =>
//           import('./colaborador/colaborador-module').then((m) => m.ColaboradorModule),
//       },
//       // Aqui agregan las demas vistas que seran accedidas por el sidebar desde el main layout
//     ],
//   },
// ];
