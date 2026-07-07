import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from '@guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        children: [
          { path: '', canActivate: [AuthGuard], component: DashboardComponent },
          {
            path: 'course',
            canActivate: [AuthGuard],
            loadChildren: () => import('./features/course/course.routes'),
          },
          {
            path: 'summary-search',
            canActivate: [AuthGuard],
            loadChildren: () => import('./features/summary-search/summary-search.routes'),
          },
        ],
      },
    ],
  },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes') },
];
