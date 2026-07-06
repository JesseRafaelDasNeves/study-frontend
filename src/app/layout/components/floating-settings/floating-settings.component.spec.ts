import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingSettingsComponent } from './floating-settings.component';

describe('FloatingSettingsComponent', () => {
  let component: FloatingSettingsComponent;
  let fixture: ComponentFixture<FloatingSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingSettingsComponent]
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
