import { signal, computed } from '@angular/core';
import { Subject } from 'rxjs';

export class MockLayoutService {
  layoutConfig = signal({
    preset: 'Aura',
    primary: 'emerald',
    surface: null,
    darkTheme: false,
    menuMode: 'static',
  });
  
  layoutState = signal({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
  });
  
  transitionComplete = signal(false);

  menuSource$ = new Subject<any>().asObservable();
  resetSource$ = new Subject<any>().asObservable();
  configUpdate$ = new Subject<any>().asObservable();
  overlayOpen$ = new Subject<any>().asObservable();

  isSidebarActive = computed(() => false);
  theme = computed(() => 'light');
  isDarkTheme = computed(() => false);
  getPrimary = computed(() => 'emerald');
  getSurface = computed(() => null);
  isOverlay = computed(() => false);

  onMenuToggle() {}
  isDesktop() { return true; }
  isMobile() { return false; }
  onConfigUpdate() {}
  onMenuStateChange() {}
  reset() {}
}
