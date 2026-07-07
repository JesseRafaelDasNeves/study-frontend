import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Summary, ExtractedTextResponse, GeneratedSummaryResponse } from '@interfaces/summary.interface';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SummaryService {
  private apiUrl = `${environment.apiLessonUrl}summaries`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Summary[]> {
    return this.http.get<Summary[]>(this.apiUrl);
  }

  getById(id: string): Observable<Summary> {
    return this.http.get<Summary>(`${this.apiUrl}/${id}`);
  }

  create(summary: Summary): Observable<Summary> {
    return this.http.post<Summary>(this.apiUrl, summary);
  }

  update(id: string, summary: Summary): Observable<Summary> {
    return this.http.put<Summary>(`${this.apiUrl}/${id}`, summary);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  extractTextFromFile(file: File): Observable<ExtractedTextResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ExtractedTextResponse>(
      `${environment.apiLessonUrl}files/extract-text`,
      formData
    );
  }

  generateSummaryFromText(text: string): Observable<GeneratedSummaryResponse> {
    return this.http.post<GeneratedSummaryResponse>(
      `${environment.apiLessonUrl}ai/summaries/by-text`,
      { text }
    );
  }
}

