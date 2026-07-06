import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../services/layout.service';
import { SettingsComponent } from '../settings/settings.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'app-topbar',
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    SettingsComponent,
    UserProfileComponent,
  ],
  templateUrl: './topbar.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class TopbarComponent {
  constructor(public readonly layoutService: LayoutService) {}

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }
}
