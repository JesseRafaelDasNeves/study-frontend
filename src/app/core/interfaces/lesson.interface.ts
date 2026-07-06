import { Course } from './course.interface';

export interface Lesson {
  id?: string;
  courseId?: string;
  course?: Course;
  title: string;
  description?: string;
  date: string; // ISO LocalDateTime string
  createdAt?: string;
  updatedAt?: string;
  hasSummary?: boolean; // Campo local de UI para controlar se exibe "Resumo salvo" ou "Sem resumo"
}
