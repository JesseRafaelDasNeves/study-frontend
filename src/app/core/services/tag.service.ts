import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag } from '@interfaces/tag.interface';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private apiUrl = `${environment.apiLessonUrl}tags`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  getById(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  create(tag: Partial<Tag>): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  update(id: string, tag: Partial<Tag>): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/${id}`, tag);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
