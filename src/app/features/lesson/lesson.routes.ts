import { Routes } from '@angular/router';
import { LessonListComponent } from './components/lesson-list/lesson-list.component';
import { LessonDetailComponent } from './components/lesson-detail/lesson-detail.component';

export default [
  { path: '', component: LessonListComponent },
  { path: ':lessonId/detail', component: LessonDetailComponent },
] as Routes;

