import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () =>
      import('./components/summary-search/summary-search.component').then(
        (m) => m.SummarySearchComponent
      ),
  },
] as Routes;
