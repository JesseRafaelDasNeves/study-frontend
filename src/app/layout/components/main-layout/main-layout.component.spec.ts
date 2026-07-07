import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PrimeNG } from 'primeng/config';
import { LayoutService } from '../../services/layout.service';
import { MockLayoutService } from '../../services/layout.service.mock';

import { MainLayoutComponent } from './main-layout.component';

describe('AppLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        PrimeNG,
        { provide: LayoutService, useClass: MockLayoutService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
