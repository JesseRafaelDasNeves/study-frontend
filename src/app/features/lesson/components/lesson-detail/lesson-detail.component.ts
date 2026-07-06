import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Lesson } from '@interfaces/lesson.interface';
import { Course } from '@interfaces/course.interface';
import { Summary } from '@interfaces/summary.interface';
import { Tag as SummaryTag } from '@interfaces/tag.interface';
import { LessonService } from '@services/lesson.service';
import { CourseService } from '@services/course.service';
import { SummaryService } from '@services/summary.service';
import { TagService } from '@services/tag.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { Chips } from 'primeng/chips';
import { InputTextarea } from 'primeng/inputtextarea';
import { forkJoin, Observable, of } from 'rxjs';

@Component({
  selector: 'app-lesson-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    TagModule,
    Chips,
    InputTextarea,
  ],
  providers: [MessageService],
  templateUrl: './lesson-detail.component.html',
  styleUrls: ['./lesson-detail.component.scss'],
})
export class LessonDetailComponent implements OnInit {
  courseId = signal<string>('');
  lessonId = signal<string>('');
  course = signal<Course | null>(null);
  lesson = signal<Lesson | null>(null);
  summary = signal<Summary | null>(null);
  loading = signal(false);

  // Estados do modo de edição manual do resumo
  isEditing = signal(false);
  summaryText = signal('');
  selectedTags = signal<string[]>([]);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly courseService: CourseService,
    private readonly lessonService: LessonService,
    private readonly summaryService: SummaryService,
    private readonly tagService: TagService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const cId = params.get('courseId');
      const lId = params.get('lessonId');
      if (cId && lId) {
        this.courseId.set(cId);
        this.lessonId.set(lId);
        this.loadAllData();
      }
    });
  }

  loadAllData() {
    this.loading.set(true);
    // Carregar informações do Curso
    this.courseService.getById(this.courseId()).subscribe({
      next: (data) => this.course.set(data),
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a disciplina.',
        });
      },
    });

    // Carregar informações da Aula
    this.lessonService.getById(this.lessonId()).subscribe({
      next: (data) => {
        this.lesson.set(data);
        this.loadSummary();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar a aula.',
        });
        this.loading.set(false);
      },
    });
  }

  loadSummary() {
    this.summaryService.getAll().subscribe({
      next: (summaries) => {
        // Encontra o resumo associado a esta lição
        const found = summaries.find((s) => s.lessonId === this.lessonId() || s.lesson?.id === this.lessonId());
        if (found) {
          this.summary.set(found);
        } else {
          this.summary.set(null);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os resumos.',
        });
        this.loading.set(false);
      },
    });
  }

  deleteSummary() {
    const sum = this.summary();
    if (!sum || !sum.id) return;

    this.loading.set(true);
    this.summaryService.delete(sum.id).subscribe({
      next: () => {
        this.summary.set(null);
        // Atualizar estado da aula localmente
        const currentLesson = this.lesson();
        if (currentLesson) {
          currentLesson.hasSummary = false;
          this.lessonService.update(currentLesson.id!, currentLesson).subscribe();
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Resumo excluído com sucesso.',
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível excluir o resumo.',
        });
        this.loading.set(false);
      },
    });
  }

  startManualEdition() {
    const currentSummary = this.summary();
    if (currentSummary) {
      this.summaryText.set(currentSummary.content);
      this.selectedTags.set(currentSummary.tags?.map((t) => t.name) || []);
    } else {
      this.summaryText.set('');
      this.selectedTags.set([]);
    }
    this.isEditing.set(true);
  }

  cancelEdition() {
    this.isEditing.set(false);
    this.summaryText.set('');
    this.selectedTags.set([]);
  }

  saveSummary() {
    if (!this.summaryText().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O conteúdo do resumo não pode estar vazio.',
      });
      return;
    }

    this.loading.set(true);

    // 1. Obter todas as tags existentes do banco
    this.tagService.getAll().subscribe({
      next: (existingTags) => {
        const tagRequests$: Observable<SummaryTag>[] = this.selectedTags().map((tagName) => {
          const trimmedName = tagName.trim();
          const found = existingTags.find(
            (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
          );
          if (found) {
            return of(found);
          } else {
            // Criar nova tag se não existir
            return this.tagService.create({ name: trimmedName });
          }
        });

        if (tagRequests$.length === 0) {
          this.submitSummary([]);
        } else {
          forkJoin(tagRequests$).subscribe({
            next: (resolvedTags) => {
              this.submitSummary(resolvedTags);
            },
            error: (err) => {
              console.error(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Erro ao processar as tags.',
              });
              this.loading.set(false);
            },
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar as tags existentes.',
        });
        this.loading.set(false);
      },
    });
  }

  private submitSummary(resolvedTags: SummaryTag[]) {
    const currentSummary = this.summary();
    const summaryPayload: Summary = {
      lessonId: this.lessonId(),
      content: this.summaryText(),
      source: 'MANUAL',
      tags: resolvedTags,
    };

    if (currentSummary && currentSummary.id) {
      // Atualizar existente
      this.summaryService.update(currentSummary.id, summaryPayload).subscribe({
        next: (saved) => {
          this.summary.set(saved);
          this.finishSave();
        },
        error: (err) => this.handleSaveError(err),
      });
    } else {
      // Criar novo
      this.summaryService.create(summaryPayload).subscribe({
        next: (saved) => {
          this.summary.set(saved);
          // Atualizar estado da aula localmente
          const currentLesson = this.lesson();
          if (currentLesson) {
            currentLesson.hasSummary = true;
            this.lessonService.update(currentLesson.id!, currentLesson).subscribe();
          }
          this.finishSave();
        },
        error: (err) => this.handleSaveError(err),
      });
    }
  }

  private finishSave() {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Resumo salvo com sucesso.',
    });
    this.isEditing.set(false);
    this.loading.set(false);
  }

  private handleSaveError(err: any) {
    console.error(err);
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível salvar o resumo.',
    });
    this.loading.set(false);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
