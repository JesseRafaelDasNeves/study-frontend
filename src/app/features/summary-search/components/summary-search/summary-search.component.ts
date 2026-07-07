import { Component, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';

// Services & Models
import { SummaryService } from '../../services/summary.service';
import { CourseService } from '@services/course.service';
import { LessonService } from '@services/lesson.service';
import { TagService } from '@services/tag.service';
import { Course } from '@interfaces/course.interface';
import { Lesson } from '@interfaces/lesson.interface';
import { Tag as GlobalTag } from '@interfaces/tag.interface';
import { SummarySearchResultItem, SummarySearchCriteria } from '../../models/summary-search.model';

@Component({
  selector: 'app-summary-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    MultiSelectModule,
    SelectButtonModule,
    PaginatorModule,
    SkeletonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './summary-search.component.html',
  styleUrls: ['./summary-search.component.scss'],
})
export class SummarySearchComponent implements OnInit {
  // Signals para gerenciar estado
  results = signal<SummarySearchResultItem[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  page = signal(0);
  size = signal(12);

  // Filtros carregados
  courses = signal<Course[]>([]);
  allLessons = signal<Lesson[]>([]);
  filteredLessons = signal<Lesson[]>([]);
  tags = signal<GlobalTag[]>([]);

  // Filtros selecionados e critérios de busca
  selectedCourseId = signal<string | null>(null);
  selectedLessonId = signal<string | null>(null);
  selectedTagIds = signal<string[]>([]);
  searchText = signal<string>('');
  sortBy = signal<'DATE' | 'RELEVANCE' | 'SIZE'>('DATE');
  sortDirection = signal<'ASC' | 'DESC'>('DESC');

  // Opções de ordenação
  sortOptions = signal([
    { label: 'Data', value: 'DATE', disabled: false },
    { label: 'Relevância', value: 'RELEVANCE', disabled: true },
    { label: 'Tamanho', value: 'SIZE', disabled: false },
  ]);

  sortDirectionOptions = [
    { label: 'Crescente', value: 'ASC', icon: 'pi pi-sort-amount-up' },
    { label: 'Decrescente', value: 'DESC', icon: 'pi pi-sort-amount-down' },
  ];

  // Subject para debounce do campo de texto
  private searchSubject = new Subject<string>();

  constructor(
    private readonly summaryService: SummaryService,
    private readonly courseService: CourseService,
    private readonly lessonService: LessonService,
    private readonly tagService: TagService,
    private readonly messageService: MessageService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.loadFilters();
    this.setupSearchDebounce();
    this.triggerSearch();

    // Cleanup RxJS no destroy
    this.destroyRef.onDestroy(() => {
      this.searchSubject.complete();
    });
  }

  private loadFilters() {
    this.courseService.getAll().subscribe({
      next: (data) => this.courses.set(data),
      error: () => this.showErrorToast('Erro ao carregar disciplinas'),
    });

    this.lessonService.getAll().subscribe({
      next: (data) => this.allLessons.set(data),
      error: () => this.showErrorToast('Erro ao carregar aulas'),
    });

    this.tagService.getAll().subscribe({
      next: (data) => this.tags.set(data),
      error: () => this.showErrorToast('Erro ao carregar tags'),
    });
  }

  private setupSearchDebounce() {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.getDestroyObservable())
      )
      .subscribe((text) => {
        this.searchText.set(text);
        
        // Regra de Relevância
        const isSearchEmpty = text.trim() === '';
        
        // Habilita/desabilita opção de Relevância
        this.sortOptions.update((options) =>
          options.map((opt) =>
            opt.value === 'RELEVANCE' ? { ...opt, disabled: isSearchEmpty } : opt
          )
        );

        if (isSearchEmpty && this.sortBy() === 'RELEVANCE') {
          this.sortBy.set('DATE');
        }

        this.resetPageAndSearch();
      });
  }

  // Helper para cleanup RxJS (takeUntil)
  private getDestroyObservable() {
    const destroy$ = new Subject<void>();
    this.destroyRef.onDestroy(() => {
      destroy$.next();
      destroy$.complete();
    });
    return destroy$.asObservable();
  }

  onSearchInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchSubject.next(inputElement?.value || '');
  }

  onCourseChange(courseId: string | null) {
    this.selectedCourseId.set(courseId);
    
    // Reseta aula selecionada
    this.selectedLessonId.set(null);

    if (courseId) {
      // Filtra as aulas do curso selecionado (usando o objeto curso embarcado em LessonResponseDTO)
      const filtered = this.allLessons().filter(
        (lesson) => lesson.course?.id === courseId
      );
      this.filteredLessons.set(filtered);
    } else {
      this.filteredLessons.set([]);
    }

    this.resetPageAndSearch();
  }

  onLessonChange(lessonId: string | null) {
    this.selectedLessonId.set(lessonId);
    this.resetPageAndSearch();
  }

  onTagsChange(tagIds: string[]) {
    this.selectedTagIds.set(tagIds);
    this.resetPageAndSearch();
  }

  onSortByChange(value: 'DATE' | 'RELEVANCE' | 'SIZE') {
    this.sortBy.set(value);
    this.resetPageAndSearch();
  }

  onSortDirectionChange(value: 'ASC' | 'DESC') {
    if (value) {
      this.sortDirection.set(value);
      this.resetPageAndSearch();
    }
  }

  onPageChange(event: any) {
    this.page.set(event.page);
    this.size.set(event.rows);
    this.triggerSearch();
  }

  resetPageAndSearch() {
    this.page.set(0);
    this.triggerSearch();
  }

  triggerSearch() {
    this.loading.set(true);

    const criteria: SummarySearchCriteria = {
      query: this.searchText() || undefined,
      courseId: this.selectedCourseId() || undefined,
      lessonId: this.selectedLessonId() || undefined,
      tagIds: this.selectedTagIds().length > 0 ? this.selectedTagIds() : undefined,
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection(),
    };

    this.summaryService.search(criteria, this.page(), this.size()).subscribe({
      next: (pagedResult) => {
        this.results.set(pagedResult.content);
        this.totalElements.set(pagedResult.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showErrorToast('Erro ao realizar a busca de resumos. Tente novamente.');
      },
    });
  }

  private showErrorToast(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: message,
      life: 5000,
    });
  }
}
