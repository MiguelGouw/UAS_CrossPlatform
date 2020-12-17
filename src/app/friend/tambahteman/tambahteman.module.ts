import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TambahtemanPageRoutingModule } from './tambahteman-routing.module';

import { TambahtemanPage } from './tambahteman.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TambahtemanPageRoutingModule
  ],
  declarations: [TambahtemanPage]
})
export class TambahtemanPageModule {}
