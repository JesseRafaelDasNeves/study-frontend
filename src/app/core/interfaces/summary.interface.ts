import { Lesson } from './lesson.interface';
import { Tag } from './tag.interface';

export type SummarySource = 'UPLOADED_FILE' | 'TOPIC' | 'MANUAL';

export interface Summary {
  id?: string;
  lessonId: string;
  lesson?: Lesson;
  title?: string;
  content: string;
  source: SummarySource;
  tags?: Tag[];
  createdAt?: string;
  updatedAt?: string;
}
export interface ExtractedTextResponse {
  originalFileName: string;
  contentType: string;
  extractedText: string;
  characterCount: number;
}

export interface GeneratedSummaryResponse {
  suggestedTitle: string;
  content: string;
  suggestedTags: string[];
}
