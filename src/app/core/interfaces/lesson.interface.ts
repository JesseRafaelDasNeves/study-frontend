export interface Lesson {
  id?: string;
  courseId: string;
  title: string;
  description?: string;
  date: string; // ISO LocalDateTime string
  createdAt?: string;
  updatedAt?: string;
  hasSummary?: boolean; // Campo local de UI para controlar se exibe "Resumo salvo" ou "Sem resumo"
}
