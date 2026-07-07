export interface SummarySearchResultItem {
  id: string;
  title: string;
  contentSnippet: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseName: string;
  tags: string[];
  createdAt: string;
  relevanceScore: number | null;
}

export interface SummarySearchCriteria {
  query?: string;
  courseId?: string;
  lessonId?: string;
  tagIds?: string[];
  sortBy?: 'DATE' | 'RELEVANCE' | 'SIZE';
  sortDirection?: 'ASC' | 'DESC';
}

export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual (0-indexed)
  size: number;
}
