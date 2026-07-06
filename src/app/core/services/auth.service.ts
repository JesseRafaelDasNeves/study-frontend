import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated(): boolean {
    // Verifica se tem token no localStorage
    const token = localStorage.getItem('token');
    return !!token;
  }

  login(user: string, password: string): boolean {
    // Simula um login bem-sucedido e armazena um token fictício
    if (user === 'admin@teste.com' && password === 'Teste@123') {
      const token = `fictitious-token-for-${user}`;
      localStorage.setItem('token', token);
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
