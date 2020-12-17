import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TambahtemanPage } from './tambahteman.page';

const routes: Routes = [
  {
    path: '',
    component: TambahtemanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TambahtemanPageRoutingModule {}
