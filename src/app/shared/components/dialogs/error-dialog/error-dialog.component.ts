import { Component, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ErrorDialogI } from './interfaces/error-dialog.interface';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-dialog',
  imports: [CommonModule, ButtonModule, PanelModule, DialogModule],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss',
})
export class ErrorDialogComponent implements OnInit {
  public data = signal<ErrorDialogI | null>(null);
  public header = signal<string>('');

  constructor(
    public dialogRef: DynamicDialogRef<ErrorDialogComponent>,
    private dialogConfig: DynamicDialogConfig<ErrorDialogI>,
  ) {}

  ngOnInit(): void {
    this.dialogConfig.showHeader = false;
    this.dialogConfig.styleClass = 'teste-123';

    if (!this.dialogConfig.width) {
      this.dialogConfig.width = '600px';
    }

    if (this.dialogConfig.data) {
      this.data.set(this.dialogConfig.data);
    }

    this.header.set(this.dialogConfig.header || 'Erro');
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
