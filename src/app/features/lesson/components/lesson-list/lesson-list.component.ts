import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Lesson } from '@interfaces/lesson.interface';
import { Course } from '@interfaces/course.interface';
import { LessonService } from '@services/lesson.service';
import { CourseService } from '@services/course.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-lesson-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
    InputTextModule,
    TextareaModule,
    CalendarModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './lesson-list.component.html',
  styleUrls: [],
})
export class LessonListComponent implements OnInit {
  courseId = signal<string>('');
  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  loading = signal(false);

  // Dialog State
  dialogVisible = signal(false);
  isEditMode = signal(false);
  editingLessonId = signal<string | null>(null);

  // Form Fields
  lessonForm = {
    title: '',
    description: '',
    date: new Date(),
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly lessonService: LessonService,
    private readonly courseService: CourseService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
  ) {}

  ngOnInit() {
    const paramsCourseId = this.route.snapshot.paramMap.get('courseId');
    if (paramsCourseId) {
      this.courseId.set(paramsCourseId);
      this.loadCourseInfo();
      this.loadLessons();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Código do curso não fornecido.',
      });
    }
  }

  loadCourseInfo() {
    this.courseService.getById(this.courseId()).subscribe({
      next: (data) => {
        this.course.set(data);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados da disciplina.',
        });
      },
    });
  }

  loadLessons() {
    this.loading.set(true);
    this.lessonService.getAll().subscribe({
      next: (data) => {
        // Filtra as aulas do backend para exibir apenas as pertencentes a este curso
        const filtered = data.filter((l) => l.courseId === this.courseId());
        // Ordena por data
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // Mapeia para UI (verifica localmente se possui resumo ou simula status)
        filtered.forEach((l) => {
          l.hasSummary = l.hasSummary ?? (Math.random() > 0.4); // Simula resumos salvos se não houver campo específico
        });
        this.lessons.set(filtered);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as aulas.',
        });
        this.loading.set(false);
      },
    });
  }

  openNewLessonDialog() {
    this.isEditMode.set(false);
    this.editingLessonId.set(null);
    this.lessonForm = {
      title: '',
      description: '',
      date: new Date(),
    };
    this.dialogVisible.set(true);
  }

  openEditLessonDialog(lesson: Lesson, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isEditMode.set(true);
    this.editingLessonId.set(lesson.id || null);
    this.lessonForm = {
      title: lesson.title,
      description: lesson.description || '',
      date: new Date(lesson.date),
    };
    this.dialogVisible.set(true);
  }

  saveLesson() {
    if (!this.lessonForm.title || !this.lessonForm.date) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios (Título e Data).',
      });
      return;
    }

    const payload: Lesson = {
      courseId: this.courseId(),
      title: this.lessonForm.title,
      description: this.lessonForm.description,
      date: this.lessonForm.date.toISOString(),
    };

    if (this.isEditMode() && this.editingLessonId()) {
      this.lessonService.update(this.editingLessonId()!, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Aula atualizada com sucesso!',
          });
          this.dialogVisible.set(false);
          this.loadLessons();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao atualizar aula.',
          });
        },
      });
    } else {
      this.lessonService.create(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Aula criada com sucesso!',
          });
          this.dialogVisible.set(false);
          this.loadLessons();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao criar aula. Verifique se o backend está ativo.',
          });
        },
      });
    }
  }

  confirmDelete(lesson: Lesson, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a aula "${lesson.title}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        if (lesson.id) {
          this.lessonService.delete(lesson.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Aula excluída com sucesso!',
              });
              this.loadLessons();
            },
            error: (err) => {
              console.error(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Falha ao excluir aula.',
              });
            },
          });
        }
      },
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  }

  backToCourses() {
    this.router.navigate(['/course']);
  }
}
