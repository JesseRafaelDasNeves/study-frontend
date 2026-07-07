# Study Genie - Frontend (study-frontend)

Este monorepo contém a aplicação web do **Study Genie**, desenvolvida em **Angular 19** utilizando o UI Kit **PrimeNG** e **Tailwind CSS 4** para estilização.

---

## 🛠️ Tecnologias e Versões

- **Angular**: 19.2.0
- **PrimeNG**: 19.1.4 (e PrimeIcons)
- **Tailwind CSS**: 4.1.17 (com integração Tailwind-PrimeUI)
- **Node.js**: v24.x recomendado
- **Gerenciador de Pacotes**: `pnpm`

---

## 📂 Estrutura do Projeto

A organização de diretórios do frontend é orientada a funcionalidades (**Features**), mantendo os arquivos modulares e de fácil manutenção:

```text
src/app
├── core/               # Guardas de rotas, interceptores e interfaces centrais
│   └── interfaces/     # Interfaces de contratos de dados com a API
├── layout/             # Componentes de estrutura e layout base (Header, Sidebar)
├── shared/             # Componentes, diretivas e pipes compartilhados globalmente
└── features/           # Funcionalidades de negócio (Lazy-Loaded)
    ├── auth/           # Fluxo de Autenticação e Login
    ├── course/         # CRUD e gerenciamento de Disciplinas
    ├── dashboard/      # Visão geral de métricas do estudante
    ├── lesson/         # CRUD de Aulas e Detalhamento da Aula (inclui assistente de resumos)
    └── summary-search/ # Motor de busca de resumos com múltiplos filtros e ordenações
```

---

## ⚡ Destaques Técnicos para Avaliação

- **Angular Signals**: Toda a reatividade de componentes locais, estados de loading, diálogos e listagens é gerenciada utilizando Signals para garantir excelente performance e código conciso.
- **Lazy Loading**: As rotas de features são resolvidas de forma preguiçosa (`loadChildren`) no arquivo principal [app.routes.ts](src/app/app.routes.ts) para otimização de bundle inicial.
- **Estilização com PrimeNG**: Elementos ricos e interativos criados exclusivamente através do ecossistema PrimeNG (`p-card`, `p-dialog`, `p-tag`, etc.) para visual consistente e acessível.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js v24.x**
- **pnpm** instalado globalmente (`npm install -g pnpm`)

### Passo 1: Instalação das Dependências
Na raiz de `apps/study-frontend`, execute:
```bash
pnpm install
```

### Passo 2: Configurar o Endereço da API (Ambientes)
Configure a URL da API REST nas configurações de ambiente:
- Para desenvolvimento local com comandos como `pnpm run start:dev` ou `pnpm run watch`, a URL deve ser preenchida em:
  `src/environments/environment.development.ts`
- Para execução de produção, configure em:
  `src/environments/environment.ts`

### Passo 3: Executar a Aplicação em Modo Dev
Rode o servidor de desenvolvimento:
```bash
pnpm start:dev
```
O frontend estará acessível em http://localhost:4200.

---

## 🧪 Testes

### Testes Existentes
A aplicação frontend em Angular conta com testes unitários configurados e isolados (totalizando **21 testes unitários**), cobrindo:

- **Componentes Globais e Estrutura**:
  - `app.component.spec.ts`: Valida a integridade do bootstrap da aplicação e títulos.
  - Componentes do diretório `layout` (`topbar`, `sidebar`, `menu`, `menu-item`, `settings`, `floating-settings`, `main-layout`, `user-profile`): Testados individualmente com isolamento de animações, roteamento e stubs como o `MockLayoutService`.
- **Shared / Diálogos**:
  - `error-dialog.component.spec.ts`: Valida o diálogo dinâmico de erros do PrimeNG integrado a mocks de `DynamicDialogRef` e `DynamicDialogConfig`.
- **Funcionalidades de Negócio (Features) e Serviços**:
  - `summary-search.component.spec.ts`: Testes do painel de busca e exibição de resumos (incluindo debounce de busca, ordenação de relevância dinâmica e reset de páginas).
  - `summary.service.spec.ts`: Testes do serviço de resumos responsável pelo envio dos parâmetros e integração HTTP.
  - `login.component.spec.ts`: Valida o fluxo e renderização da tela de autenticação integrada com mocks do `AuthService` e `Router`.
  - `dashboard.component.spec.ts`: Teste unitário da estrutura inicial do painel de controle do estudante.

### Como Executar os Testes
Para rodar a suíte completa de testes unitários no frontend de forma isolada e headless:

```bash
pnpm test -- --watch=false --browsers=ChromeHeadless
```