import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LayoutService } from '../../services/layout.service';
import { MockLayoutService } from '../../services/layout.service.mock';

import { MenuItemComponent } from './menu-item.component';

describe('MenuItemComponent', () => {
  let component: MenuItemComponent;
  let fixture: ComponentFixture<MenuItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuItemComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations()
      ]
    })
    .overrideComponent(MenuItemComponent, {
      set: {
        providers: [
          { provide: LayoutService, useClass: MockLayoutService }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuItemComponent);
    component = fixture.componentInstance;
    component.item = { label: 'Test Item', routerLink: ['/'] };
    component.index = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
