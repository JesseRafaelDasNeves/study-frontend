import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Pipe({ name: 'formError', standalone: true })
export class FormErrorPipe implements PipeTransform {
  transform(errors: ValidationErrors | null | undefined): string {
    if (!errors) return '';

    const label = 'Este campo';
    
    if (errors['required']) {
      return `${label} é obrigatório.`;
    }
    if (errors['minlength']) {
      return `${label} deve ter no mínimo ${errors['minlength'].requiredLength} caracteres.`;
    }
    if (errors['maxlength']) {
      return `${label} deve ter no máximo ${errors['maxlength'].requiredLength} caracteres.`;
    }
    if (errors['email']) {
      return `Por favor, insira um email válido.`;
    }
    if (errors['pattern']) {
      return `${label} está em formato inválido.`;
    }
    
    return '';
  }
}