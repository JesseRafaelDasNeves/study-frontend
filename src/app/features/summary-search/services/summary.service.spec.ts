import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SummaryService } from './summary.service';
import { environment } from '@environments/environment';
import { SummarySearchCriteria } from '../models/summary-search.model';

describe('SummaryService', () => {
  let service: SummaryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SummaryService],
    });
    service = TestBed.inject(SummaryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve montar HttpParams corretamente omitindo filtros vazios', () => {
    const criteria: SummarySearchCriteria = {
      query: '  ', // String de espaços em branco (deve ser omitida)
      courseId: undefined,
      lessonId: undefined,
      tagIds: [], // Array vazio (deve ser omitida)
      sortBy: 'DATE',
      sortDirection: 'DESC',
    };

    service.search(criteria, 0, 10).subscribe();

    const req = httpMock.expectOne((request) => {
      const url = `${environment.apiLessonUrl}summaries/search`;
      return (
        request.url === url &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        !request.params.has('query') &&
        !request.params.has('courseId') &&
        !request.params.has('lessonId') &&
        !request.params.has('tagIds') &&
        request.params.get('sortBy') === 'DATE' &&
        request.params.get('sortDirection') === 'DESC'
      );
    });

    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve incluir todos os filtros preenchidos na requisição', () => {
    const criteria: SummarySearchCriteria = {
      query: 'aula teste',
      courseId: 'course-uuid-1',
      lessonId: 'lesson-uuid-2',
      tagIds: ['tag-1', 'tag-2'],
      sortBy: 'RELEVANCE',
      sortDirection: 'ASC',
    };

    service.search(criteria, 1, 20).subscribe();

    const req = httpMock.expectOne((request) => {
      return (
        request.params.get('page') === '1' &&
        request.params.get('size') === '20' &&
        request.params.get('query') === 'aula teste' &&
        request.params.get('courseId') === 'course-uuid-1' &&
        request.params.get('lessonId') === 'lesson-uuid-2' &&
        request.params.getAll('tagIds')?.length === 2 &&
        request.params.getAll('tagIds')?.[0] === 'tag-1' &&
        request.params.get('sortBy') === 'RELEVANCE' &&
        request.params.get('sortDirection') === 'ASC'
      );
    });

    expect(req).toBeTruthy();
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
