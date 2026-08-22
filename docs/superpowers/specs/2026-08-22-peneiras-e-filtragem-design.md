# Peneiras e Filtragem — Design

## Contexto

O app (HiringSys) já tem um sistema de tabela reutilizável (`Table.vue` +
`Row.vue` + `fields/*.vue`) usado hoje só pela página `CandidatesView.vue`.
Esse sistema está fortemente acoplado ao tipo `Candidate`: `Row.vue` resolve
qual field-component renderar por uma cadeia `v-else-if` sobre `column.key`,
e `grid.ts` mede largura de coluna em JS especificamente para campos de
candidato.

Este spec cobre duas páginas novas:

1. **Processos seletivos** (`/peneiras`) — lista de peneiras, mockup em
   `Ops -_ Sieves.jpg`.
2. **Filtragem de uma peneira** (`/peneiras/:id`) — seleção de candidatos
   aprovados/reprovados de uma peneira específica via drag, mockup em
   `Ops -_ Filter.jpg`.

Ambas devem reaproveitar `Row.vue`, o que exige generalizar o sistema de
tabela para não conhecer mais nenhum campo específico de `Candidate`.

## Decisões já validadas com o usuário

- O limite de aprovação (X) da Filtragem vem de um campo fixo no mock da
  peneira (`approvalLimit`), não é derivado de outra coluna nem hardcoded
  globalmente.
- Na lista de Peneiras, a navegação para a página de Filtragem acontece
  **só ao clicar no nome/título do processo seletivo**, não na row inteira.
- O botão ícone-only tem duas variantes de cor: `primary` (azul, ações como
  adicionar pessoa/download/share) e `neutral` (cinza, usado no botão de
  filtro).
- Lixeira e menu de três pontos são só visuais nesta iteração (no-op).
- O botão de funil (filtro avançado) também é só visual nesta iteração — a
  filtragem em si já é coberta pelos chips.

## 1. Generalização do Table/Row

### Tipo de coluna genérico

```ts
// src/components/ui/table/types.ts
export interface TableColumn<T> {
  key: string
  label: string
  size?: 'sm' | 'md' | 'lg'   // default 'md'
  align?: 'start' | 'center'
  component: Component
  props: (item: T) => Record<string, unknown>
}
```

`Row.vue` e `Table.vue` passam a ser genéricos sobre `T extends { id: string
| number }` e **não importam mais nenhum field-component diretamente**:

```vue
<component :is="column.component" v-bind="column.props(item)" />
```

Isso remove a cadeia `v-else-if` de `Row.vue` e o acoplamento a
`Candidate`/`TableColumnKey`. `TableColumnKey` (union fixa de chaves) é
removida — cada página usa `string` livre para `key` (só precisa ser única
dentro do array de colunas daquela página).

### Larguras via CSS, não medição em JS

Removo a lógica de `contentWidth()` em `grid.ts` (que mede caracteres de
`Candidate` especificamente). Em vez disso:

- `index.css` (`@theme`) ganha 3 tiers de largura máxima:
  ```css
  --container-slot-sm: 7rem;
  --container-slot-md: 11rem;
  --container-slot-lg: 18rem;
  ```
  (Tailwind v4 gera `max-w-slot-sm|md|lg` a partir do namespace
  `--container-*`.)
- `gridTemplate(columns)` monta cada trilha como
  `minmax(min-content, var(--container-slot-<size>))`, usando
  `column.size ?? 'md'`. Não depende mais de `items`.
- Cada página decide o `size` por coluna ao declarar `columns`: campos
  numéricos/badge curtos → `sm`; textos médios (telefone, cargo) → `md`;
  nome/título com subtítulo → `lg`.
- `CandidateField.vue` troca `max-w-56` por `max-w-slot-lg`, mantendo o
  truncamento do nome em sincronia com a largura real da coluna.

### Drag opcional e slot de ações

- `Table.vue` ganha prop `draggable?: boolean` (default `true`). Quando
  `false`, renderiza um `v-for` simples em vez de `<draggable>` (sem grip,
  sem reorder) — caso da lista de Peneiras.
- `Row.vue` ganha prop `draggable?: boolean` (default `true`, controla só a
  visibilidade do handle) e um slot nomeado `#actions="{ item }"` para
  ícones finais de linha (lixeira/kebab na lista de Peneiras). Quando o
  slot não é usado, nada é renderizado ali.
- `gridTemplate()` só inclui a trilha do handle quando `draggable` é
  verdadeiro.

### Novos field-components genéricos e reutilizáveis

- `TextField.vue` — texto simples (`{{ value }}`), reusado em "Cargo" tanto
  de `Candidate` quanto de `SelectiveProcess`.
- `CountField.vue` — número simples, reusado em "Disponíveis" e
  "Participantes".

## 2. Página de Peneiras (`/peneiras`)

### Modelo de dados

```ts
// src/types/peneira.ts
export const ProcessStatus = {
  Encerrado: 'encerrado',
  EmProcesso: 'em_processo',
  Pausado: 'pausado',
  EmColeta: 'em_coleta',
  Rascunho: 'rascunho',
} as const
export type ProcessStatus = (typeof ProcessStatus)[keyof typeof ProcessStatus]

export interface SelectiveProcess {
  id: string | number
  jobTitle: string       // "Desenvolvedor frontend"
  department: string     // subtítulo, ex: "Plataforma de Recebíveis"
  status: ProcessStatus
  availableSlots: number // "Disponíveis"
  participants: number
  role: string            // "Cargo", ex: "Desenvolvedores"
  approvalLimit: number   // X membros aprováveis, consumido pela Filtragem
}
```

### Componentes de campo novos

- `JobTitleField.vue` — título + subtítulo (mesmo layout de duas linhas do
  `CandidateField`, sem avatar). Aceita `to?: RouteLocationRaw` opcional; se
  presente, renderiza o título como `RouterLink` (é assim que a navegação
  "só pelo nome" é implementada, sem o `Row` saber de rota nenhuma).
- `ProcessStatusField.vue` — badge por `ProcessStatus`, mesma linguagem
  visual do `StatusField`/`SeniorityField` (cores: encerrado=red,
  em_processo=blue, pausado=yellow, em_coleta=green, rascunho=gray).

### Chips de filtro (por status)

Componente novo `FilterChips.vue`, genérico:
```ts
defineProps<{ options: { key: string; label: string }[] }>()
const active = defineModel<string[]>({ default: () => [] })
```
Renderiza pills `rounded-full` (visual herdado do `Button`) com estado
ativo/inativo (azul/cinza), mais um `Button` ícone-only `variant="neutral"`
com ícone de funil ao final (visual, no-op nesta iteração).

Em `PeneirasView.vue`, `options` = os `ProcessStatus`; o `v-model` filtra
quais linhas da lista aparecem (`items = allProcesses.filter(p =>
active.includes(p.status))`). Estado inicial: todos os status ativos (lista
completa visível por padrão).

### Layout da página

- Cabeçalho: `h1` + `Button` ícone-only `variant="primary"` (ícone de
  grade/grid, no-op).
- `FilterChips` para status.
- `Table :columns :items :draggable="false"`, com `#actions` mostrando
  lixeira + kebab (`Button` ícone-only `variant="neutral"`, no-op).
- Colunas: `jobTitle` (`JobTitleField`, `size: 'lg'`, com `to` pra rota
  `peneira-filtragem`), `status` (`ProcessStatusField`, `sm`), `availableSlots`
  (`CountField`, `sm`), `participants` (`CountField`, `sm`), `role`
  (`TextField`, `md`).

## 3. Página de Filtragem (`/peneiras/:id`)

### Mecânica de aprovação

Componente novo `SelectionTable.vue`. Extraio o cabeçalho de colunas de
`Table.vue` para um componente interno compartilhado `TableHeader.vue`
(mesmo grid-template, mesmo visual), usado tanto por `Table.vue` quanto por
`SelectionTable.vue` — evita duplicar a lógica de header/grid.

Estado interno: dois `ref<Candidate[]>` — `approved` e `rejected`,
inicializados a partir da prop `items` conforme `candidate.status`. Duas
`<draggable>` (via `vuedraggable`), ligadas por `group` (mesmo nome) para
permitir arrastar entre as duas listas:

- Zona aprovada: wrapper visual `bg-blue/10 rounded-medium p-3` (o "quadrado
  azul" do mockup). `group.put` valida `(to) => to.list.length <
  approvalLimit`, travando novas entradas quando a zona está cheia.
- Zona reprovada: lista simples abaixo, sem wrapper.

Status não é um dado fixo do item nessa página: a cada evento `@change` em
qualquer uma das duas listas, `SelectionTable` reescreve `status =
'aprovado'` para todo item em `approved` e `status = 'reprovado'` para todo
item em `rejected`, e emite `update:items` com a concatenação das duas
listas. Isso mantém `StatusField`/`Row` sem nenhuma ciência de "zona" —
eles só leem `candidate.status` como sempre leram.

### Chips de filtro (por coluna visível)

Mesmo `FilterChips.vue`, mas aqui o `v-model` filtra o array `columns`
passado pro `SelectionTable` (não as linhas): opções = todas as colunas
disponíveis (Nome, Estado, Telefone, Network, Cargo, Expectativa salarial,
Tempo de experiência, Senioridade). "Nome" fica sempre ativo — a página
força essa chave presente no filtro, sem opção de desmarcar. Estado inicial
das demais: Nome, Estado, Telefone e Network ativos (colunas mostradas de
início), o resto inativo — igual ao mockup.

### Novos campos de candidato

```ts
// src/components/ui/table/types.ts — extensão de Candidate
export interface Candidate {
  // ...existentes
  role: string             // "Cargo"
  salaryExpectation: number // "Expectativa salarial"
}
```
Novo `SalaryField.vue` — formata `salaryExpectation` em `R$` (ex:
`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`).
`TextField.vue` cobre "Cargo". "Tempo de experiência" já existe
(`experienceYears`/`ExperienceField`).

### Layout da página

- Cabeçalho: `h1` (nome da peneira) + subtítulo (empresa, mês) + `Button`
  ícone-only `variant="primary"` para adicionar pessoa / download / share
  (todos no-op).
- `FilterChips` para colunas visíveis.
- `SelectionTable :columns :items="candidatesOfProcess" :approval-limit`.

## 4. Button ícone-only

`Button.vue` ganha:
```ts
withDefaults(defineProps<{
  text?:     string
  icon?:     IconName
  variant?:  'primary' | 'neutral'
  rounded?:  boolean
  disabled?: boolean
}>(), { variant: 'primary', rounded: false, disabled: false })
```
Quando `icon` está presente e `text` não, renderiza só o ícone, vira
quadrado (`aspect-square`, padding simétrico) em vez do padding retangular
com texto. `variant="neutral"` troca `bg-blue`/`--color-blue-co` por
`bg-gray`/tom neutro equivalente (cinza + sombra cinza), mantendo o mesmo
`press-shadow`.

## 5. Rotas, sidebar e mocks

- `routes.ts`: `/peneiras` (`name: 'peneiras'`) → `PeneirasView.vue`;
  `/peneiras/:id` (`name: 'peneira-filtragem'`) → `FiltragemView.vue`.
- `Sidebar.vue`: novo `RouterLink` para `/peneiras` (ícone a definir, ex.
  `ListChecks` do lucide).
- `src/service/Peneiras.ts` (mesmo padrão simples de `Access.ts`): mock de
  `SelectiveProcess[]` e uma função que retorna os candidatos mock de uma
  peneira por `id` (reaproveitando o tipo `Candidate`, cada peneira com uns
  7 candidatos pra demonstrar o corte aprovado/reprovado).
- Mock de candidatos existente (hoje inline em `CandidatesView.vue`) ganha
  `role` e `salaryExpectation` nos itens.

## Fora de escopo (explicitamente, por resposta do usuário)

- Qualquer efeito real de lixeira/menu de três pontos.
- Painel de filtro avançado atrás do botão de funil.
- Qualquer persistência — tudo em mock, em memória do componente/serviço.
- Edição do `approvalLimit` pela UI (é só um campo fixo do mock).
