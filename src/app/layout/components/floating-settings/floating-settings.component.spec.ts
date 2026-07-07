import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PrimeNG } from 'primeng/config';
import { provideRouter } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { MockLayoutService } from '../../services/layout.service.mock';

import { FloatingSettingsComponent } from './floating-settings.component';

describe('FloatingSettingsComponent', () => {
  let component: FloatingSettingsComponent;
  let fixture: ComponentFixture<FloatingSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingSettingsComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        PrimeNG,
        { provide: LayoutService, useClass: MockLayoutService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
