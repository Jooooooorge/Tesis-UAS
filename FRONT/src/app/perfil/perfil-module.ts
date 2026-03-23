import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Perfil } from './perfil';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: Perfil },
    ]),
  ],
})
export class PerfilModule {}
