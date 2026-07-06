import { Lesson } from './lesson.interface';
import { Tag } from './tag.interface';

export type SummarySource = 'UPLOADED_FILE' | 'TOPIC' | 'MANUAL';

export interface Summary {
  id?: string;
  lessonId: string;
  lesson?: Lesson;
  content: string;
  source: SummarySource;
  tags?: Tag[];
  createdAt?: string;
  updatedAt?: string;
}
