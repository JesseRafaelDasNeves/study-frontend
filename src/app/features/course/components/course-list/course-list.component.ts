import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Course } from '@interfaces/course.interface';
import { CourseService } from '@services/course.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-list',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
    InputTextModule,
    TextareaModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './course-list.component.html',
})
export class CourseListComponent implements OnInit {

  courses = signal<Course[]>([]);
  loading = signal(false);

  // Dialog State
  dialogVisible = signal(false);
  isEditMode = signal(false);
  editingCourseId = signal<string | null>(null);

  // Form Fields
  courseForm = {
    name: '',
    acronym: '',
    color: '#2563eb',
    description: '',
  };

  // Active course selected for menu actions
  activeCourse: Course | null = null;

  // Dropdown menu items
  menuItems: MenuItem[] = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => {
        if (this.activeCourse) {
          this.openEditCourseDialog(this.activeCourse);
        }
      },
    },
    {
      label: 'Excluir',
      icon: 'pi pi-trash',
      styleClass: 'text-red-600',
      command: () => {
        if (this.activeCourse) {
          this.confirmDelete(this.activeCourse);
        }
      },
    },
    {
      label: 'Aulas',
      icon: 'pi pi-calendar',
      command: () => {
        if (this.activeCourse) {
          this.navigateToLessons(this.activeCourse);
        }
      },
    },
  ];

  constructor(
    private readonly courseService: CourseService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.loadCourses();
  }

  navigateToLessons(course: Course) {
    if (course.id) {
      this.router.navigate(['/course', course.id, 'lesson']);
    }
  }


  async loadCourses() {
    this.loading.set(true);
    this.courseService.getAll().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as disciplinas.',
        });
        this.loading.set(false);
      },
    });
  }

  openNewCourseDialog() {
    this.isEditMode.set(false);
    this.editingCourseId.set(null);
    this.courseForm = {
      name: '',
      acronym: '',
      color: '#2563eb',
      description: '',
    };
    this.dialogVisible.set(true);
  }

  openEditCourseDialog(course: Course) {
    this.isEditMode.set(true);
    this.editingCourseId.set(course.id || null);
    this.courseForm = {
      name: course.name,
      acronym: course.acronym,
      color: course.color,
      description: course.description || '',
    };
    this.dialogVisible.set(true);
  }

  saveCourse() {
    if (!this.courseForm.name || !this.courseForm.acronym || !this.courseForm.color) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios (Nome, Sigla e Cor).',
      });
      return;
    }

    const payload: Course = {
      name: this.courseForm.name,
      acronym: this.courseForm.acronym,
      color: this.courseForm.color,
      description: this.courseForm.description,
    };

    if (this.isEditMode() && this.editingCourseId()) {
      this.courseService.update(this.editingCourseId()!, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Disciplina atualizada com sucesso!',
          });
          this.dialogVisible.set(false);
          this.loadCourses();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao atualizar disciplina.',
          });
        },
      });
    } else {
      this.courseService.create(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Disciplina criada com sucesso!',
          });
          this.dialogVisible.set(false);
          this.loadCourses();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao criar disciplina.',
          });
        },
      });
    }
  }

  confirmDelete(course: Course) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a disciplina "${course.name}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        if (course.id) {
          this.courseService.delete(course.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Disciplina excluída com sucesso!',
              });
              this.loadCourses();
            },
            error: (err) => {
              console.error(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Falha ao excluir disciplina.',
              });
            },
          });
        }
      },
    });
  }
}
