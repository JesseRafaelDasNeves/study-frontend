import { Component, ViewEncapsulation } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-sidebar',
  imports: [MenuComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="layout-sidebar">
      <app-menu></app-menu>
    </div>
  `,
})
export class SidebarComponent {}
