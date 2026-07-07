import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Lesson } from '@interfaces/lesson.interface';
import { Course } from '@interfaces/course.interface';
import { Summary, SummarySource } from '@interfaces/summary.interface';
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
import { SkeletonModule } from 'primeng/skeleton';
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
    SkeletonModule,
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

  // Novos estados para o modo de geração por arquivo
  isGeneratingFromFile = signal(false);
  fileName = signal('');
  extractedText = signal('');
  extractedWordCount = signal(0);
  aiSummaryText = signal('');
  extractingTextLoading = signal(false);
  aiSummaryLoading = signal(false);

  // Novos estados para o modo de geração por tópico
  isGeneratingFromTopic = signal(false);
  topicInput = signal('');
  aiTopicSummaryText = signal('');
  aiTopicLoading = signal(false);
  hasGenerated = signal(false);


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
          this.lessonService.getById(currentLesson.id!).subscribe({
            next: (data) => this.lesson.set(data),
            error: (err) => {
              console.error(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Não foi possível carregar a aula.',
              });
            },
          });
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
    this.processTagsAndSave(this.summaryText(), 'MANUAL');
  }

  saveAISummary() {
    if (!this.aiSummaryText().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O conteúdo do resumo não pode estar vazio.',
      });
      return;
    }
    this.processTagsAndSave(this.aiSummaryText(), 'UPLOADED_FILE');
  }

  private processTagsAndSave(content: string, source: SummarySource) {
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
          this.submitSummary([], content, source);
        } else {
          forkJoin(tagRequests$).subscribe({
            next: (resolvedTags) => {
              this.submitSummary(resolvedTags, content, source);
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

  private submitSummary(resolvedTags: SummaryTag[], content: string, source: SummarySource) {
    const currentSummary = this.summary();
    const summaryPayload: Summary = {
      lessonId: this.lessonId(),
      content: content,
      source: source,
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
    this.isGeneratingFromFile.set(false);
    this.isGeneratingFromTopic.set(false);
    this.discardSummary();
    this.discardTopicSummary();
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

  // Métodos para controle do fluxo de geração por arquivo
  startFileGeneration() {
    this.discardSummary();
    this.isGeneratingFromFile.set(true);
  }

  cancelFileGeneration() {
    this.isGeneratingFromFile.set(false);
    this.discardSummary();
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.extractText(file);
    }
  }

  extractText(file: File) {
    this.extractingTextLoading.set(true);
    this.fileName.set(file.name);
    this.extractedText.set('');
    this.extractedWordCount.set(0);
    this.aiSummaryText.set('');

    this.summaryService.extractTextFromFile(file).subscribe({
      next: (res) => {
        this.extractedText.set(res.extractedText);
        // Calcular número de palavras
        const wordCount = res.extractedText
          ? res.extractedText.trim().split(/\s+/).filter(Boolean).length
          : 0;
        this.extractedWordCount.set(wordCount);
        this.extractingTextLoading.set(false);

        // Chamar geração de resumo com IA
        this.generateAISummary(res.extractedText);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.error?.message || 'Não foi possível extrair o texto do arquivo.',
        });
        this.discardSummary();
      },
    });
  }

  generateAISummary(text: string) {
    this.aiSummaryLoading.set(true);
    this.summaryService.generateSummaryFromText(text).subscribe({
      next: (res) => {
        this.aiSummaryText.set(res.content);
        this.selectedTags.set(res.suggestedTags || []);
        this.aiSummaryLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível gerar o resumo com IA.',
        });
        this.aiSummaryLoading.set(false);
      },
    });
  }

  discardSummary() {
    this.fileName.set('');
    this.extractedText.set('');
    this.extractedWordCount.set(0);
    this.aiSummaryText.set('');
    this.selectedTags.set([]);
    this.extractingTextLoading.set(false);
    this.aiSummaryLoading.set(false);
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

  // Métodos para controle do fluxo de geração por tópico
  startTopicGeneration() {
    this.discardTopicSummary();
    this.isGeneratingFromTopic.set(true);
  }

  cancelTopicGeneration() {
    this.isGeneratingFromTopic.set(false);
    this.discardTopicSummary();
  }

  generateSummaryFromTopic() {
    if (!this.topicInput().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, informe um tópico.',
      });
      return;
    }
    this.aiTopicLoading.set(true);
    this.hasGenerated.set(true);
    this.aiTopicSummaryText.set('');
    this.selectedTags.set([]);

    this.summaryService.generateSummaryFromTopic(this.topicInput()).subscribe({
      next: (res) => {
        this.aiTopicSummaryText.set(res.content);
        this.selectedTags.set(res.suggestedTags || []);
        this.aiTopicLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível gerar o resumo para o tópico informado.',
        });
        this.aiTopicLoading.set(false);
        this.hasGenerated.set(false);
      },
    });
  }

  saveTopicSummary() {
    if (!this.aiTopicSummaryText().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O conteúdo do resumo não pode estar vazio.',
      });
      return;
    }
    this.processTagsAndSave(this.aiTopicSummaryText(), 'TOPIC');
  }

  discardTopicSummary() {
    this.topicInput.set('');
    this.aiTopicSummaryText.set('');
    this.selectedTags.set([]);
    this.aiTopicLoading.set(false);
    this.hasGenerated.set(false);
  }

}
