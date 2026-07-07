import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SummarySearchComponent } from './summary-search.component';
import { SummaryService } from '../../services/summary.service';
import { CourseService } from '@services/course.service';
import { LessonService } from '@services/lesson.service';
import { TagService } from '@services/tag.service';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

describe('SummarySearchComponent', () => {
  let component: SummarySearchComponent;
  let fixture: ComponentFixture<SummarySearchComponent>;
  let summaryServiceSpy: jasmine.SpyObj<SummaryService>;
  let courseServiceSpy: jasmine.SpyObj<CourseService>;
  let lessonServiceSpy: jasmine.SpyObj<LessonService>;
  let tagServiceSpy: jasmine.SpyObj<TagService>;

  beforeEach(async () => {
    const summarySpy = jasmine.createSpyObj('SummaryService', ['search']);
    const courseSpy = jasmine.createSpyObj('CourseService', ['getAll']);
    const lessonSpy = jasmine.createSpyObj('LessonService', ['getAll']);
    const tagSpy = jasmine.createSpyObj('TagService', ['getAll']);

    courseSpy.getAll.and.returnValue(of([]));
    lessonSpy.getAll.and.returnValue(of([]));
    tagSpy.getAll.and.returnValue(of([]));
    summarySpy.search.and.returnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 }));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SummarySearchComponent],
      providers: [
        { provide: SummaryService, useValue: summarySpy },
        { provide: CourseService, useValue: courseSpy },
        { provide: LessonService, useValue: lessonSpy },
        { provide: TagService, useValue: tagSpy },
        MessageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SummarySearchComponent);
    component = fixture.componentInstance;
    summaryServiceSpy = TestBed.inject(SummaryService) as jasmine.SpyObj<SummaryService>;
    courseServiceSpy = TestBed.inject(CourseService) as jasmine.SpyObj<CourseService>;
    lessonServiceSpy = TestBed.inject(LessonService) as jasmine.SpyObj<LessonService>;
    tagServiceSpy = TestBed.inject(TagService) as jasmine.SpyObj<TagService>;

    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve desabilitar ordenador de Relevância por padrão (busca textual vazia)', () => {
    const relevanceOption = component.sortOptions().find((o) => o.value === 'RELEVANCE');
    expect(relevanceOption?.disabled).toBeTrue();
  });

  it('deve disparar a busca com debounce de 400ms na digitação', fakeAsync(() => {
    const inputElement = { target: { value: 'inteligência artificial' } } as unknown as Event;
    
    // Simula a entrada do usuário
    component.onSearchInput(inputElement);
    
    // Verifica que a busca ainda não foi disparada antes de 400ms
    expect(summaryServiceSpy.search).toHaveBeenCalledTimes(1); // Foi chamado uma vez no ngOnInit inicial
    
    tick(200);
    expect(summaryServiceSpy.search).toHaveBeenCalledTimes(1);
    
    tick(200); // Completa 400ms
    expect(summaryServiceSpy.search).toHaveBeenCalledTimes(2); // Segunda vez disparada pelo debounce
    expect(component.searchText()).toBe('inteligência artificial');

    const relevanceOption = component.sortOptions().find((o) => o.value === 'RELEVANCE');
    expect(relevanceOption?.disabled).toBeFalse();
  }));

  it('deve desabilitar Relevância e resetar para Data se busca textual for limpa', fakeAsync(() => {
    // Primeiro digita algo para habilitar Relevância
    component.onSearchInput({ target: { value: 'inteligência' } } as unknown as Event);
    tick(400);

    // Altera ordenação para Relevância
    component.onSortByChange('RELEVANCE');
    expect(component.sortBy()).toBe('RELEVANCE');

    // Agora limpa a busca
    component.onSearchInput({ target: { value: '' } } as unknown as Event);
    tick(400);

    // A opção Relevância deve estar desabilitada de novo
    const relevanceOption = component.sortOptions().find((o) => o.value === 'RELEVANCE');
    expect(relevanceOption?.disabled).toBeTrue();

    // O ordenador deve voltar para DATE automaticamente
    expect(component.sortBy()).toBe('DATE');
  }));

  it('deve resetar página para zero ao mudar filtros', () => {
    component.page.set(2);
    
    // Muda a disciplina
    component.onCourseChange('course-uuid');
    
    expect(component.page()).toBe(0);
  });
});
