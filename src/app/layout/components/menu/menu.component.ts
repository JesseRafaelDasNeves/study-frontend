import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule, MenuItemComponent],
  encapsulation: ViewEncapsulation.None,
  template: `
    <ul class="layout-menu">
      <ng-container *ngFor="let item of itens; let i = index">
        <li
          app-menu-item
          *ngIf="!item.separator"
          [item]="item"
          [index]="i"
          [root]="true"
        ></li>
        <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
    </ul>
  `,
})
export class MenuComponent {
  itens: MenuItem[] = [];

  ngOnInit() {
    this.itens = [
      {
        label: '',
        items: [
          { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] },
          { label: 'Disciplinas', icon: 'pi pi-fw pi-graduation-cap', routerLink: ['/course'] },
          { label: 'Busca de Resumos', icon: 'pi pi-fw pi-search', routerLink: ['/summary-search'] },
        ],
      },
    ];
  }
}
