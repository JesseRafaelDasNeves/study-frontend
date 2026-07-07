import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PagedResult, SummarySearchCriteria, SummarySearchResultItem } from '../models/summary-search.model';

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  private apiUrl = `${environment.apiLessonUrl}summaries/search`;

  constructor(private readonly http: HttpClient) {}

  search(
    criteria: SummarySearchCriteria,
    page: number,
    size: number
  ): Observable<PagedResult<SummarySearchResultItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (criteria.query && criteria.query.trim() !== '') {
      params = params.set('query', criteria.query.trim());
    }

    if (criteria.courseId) {
      params = params.set('courseId', criteria.courseId);
    }

    if (criteria.lessonId) {
      params = params.set('lessonId', criteria.lessonId);
    }

    if (criteria.tagIds && criteria.tagIds.length > 0) {
      // Passa múltiplos parâmetros tagIds ou junta
      criteria.tagIds.forEach((tagId) => {
        params = params.append('tagIds', tagId);
      });
    }

    if (criteria.sortBy) {
      params = params.set('sortBy', criteria.sortBy);
    }

    if (criteria.sortDirection) {
      params = params.set('sortDirection', criteria.sortDirection);
    }

    return this.http.get<PagedResult<SummarySearchResultItem>>(this.apiUrl, { params });
  }
}
