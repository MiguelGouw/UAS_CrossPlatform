import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TambahtemanPage } from './tambahteman.page';

describe('TambahtemanPage', () => {
  let component: TambahtemanPage;
  let fixture: ComponentFixture<TambahtemanPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TambahtemanPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TambahtemanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
