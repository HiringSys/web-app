# Peneiras e Filtragem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Processos seletivos" list page (`/peneiras`) and the "Filtragem de uma peneira" page (`/peneiras/:id`), generalizing the existing `Table`/`Row` system so both pages reuse it instead of duplicating table logic.

**Architecture:** `TableColumn<T>` becomes generic — each column carries the field component and a props-mapper function, so `Row.vue`/`Table.vue` render any entity without knowing its shape. Column width becomes a 3-tier CSS system (`sm`/`md`/`lg` → Tailwind `max-w-slot-*` utilities) replacing JS text measurement. A new `SelectionTable.vue` implements the approve/reject drag mechanic as two `vuedraggable` lists linked by `group`, capped by `approvalLimit`.

**Tech Stack:** Vue 3 `<script setup>` (incl. generic components), Vue Router, `vuedraggable` (SortableJS), Tailwind CSS v4, `@lucide/vue` icons. No test framework is installed in this repo.

**Spec:** `docs/superpowers/specs/2026-08-22-peneiras-e-filtragem-design.md`

## Global Constraints

- UI copy is Portuguese (pt-BR), matching existing label style (e.g. "Nome", "Estado", "Telefone").
- No new npm dependencies — build only with what's already in `package.json` (`vue`, `vue-router`, `vuedraggable`, `@lucide/vue`, `tailwindcss`).
- No backend/persistence — all data is mocked in-memory (service files or component refs). No `localStorage`, no network calls.
- This repo has no automated test framework (no vitest/jest present). Verification per task is: `npm run build` (runs `vue-tsc -b && vite build`, i.e. full type-check + build) plus a manual browser walkthrough via `npm run dev`.
- New design tokens follow the existing `@theme` pattern in `src/index.css`: a base color gets a paired `-co` (shadow/companion) token, e.g. `--color-blue` / `--color-blue-co`.
- Icon names below are pre-verified to exist in the installed `@lucide/vue` package: `Filter`, `LayoutGrid`, `ListChecks`, `UserPlus`, `Download`, `Share2`, `EllipsisVertical`, `Trash2`, `Home`, `Grip`, `Check`, `X`, `PanelLeftClose`, `PanelLeftOpen`. Do not substitute unverified names (e.g. `Grip3x3` does **not** exist in this package).
- Trash/kebab-menu actions are visual no-ops in this iteration (per spec, explicitly out of scope to wire up).

---

### Task 1: Generalize the Table/Row system

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/ui/table/types.ts`
- Modify: `src/components/ui/table/style/grid.ts`
- Create: `src/components/ui/table/TableHeader.vue`
- Modify: `src/components/ui/table/Table.vue`
- Modify: `src/components/ui/table/Row.vue`
- Modify: `src/components/ui/table/fields/CandidateField.vue`
- Create: `src/components/ui/table/columns/candidateColumns.ts`
- Modify: `src/views/CandidatesView.vue`
- Modify: `src/views/TestsView.vue`

**Interfaces:**
- Produces: `TableColumn<T>` (`{ key, label, size?, align?, component, props }`), `gridTemplate<T>(columns: TableColumn<T>[], draggable?: boolean): string`, `candidateColumns(): TableColumn<Candidate>[]`, `Table.vue` props `{ columns, items, draggable? }` + `#actions` slot, `Row.vue` props `{ item, columns, gridTemplateColumns, draggable? }` + `#actions` slot, `TableHeader.vue` props `{ columns, gridTemplateColumns, draggable? }`.
- Consumes: nothing from other tasks (this is the foundation task).

This is one atomic task: `Row`/`Table`'s prop contract changes in a breaking way, so their only two consumers (`CandidatesView.vue`, `TestsView.vue`) must be updated in the same task to keep the app building. No new fields are added here — this is a pure mechanical refactor with zero visible behavior change.

- [ ] **Step 1: Add the 3 slot max-width theme tokens**

Edit `src/index.css`. Find:

```css
  --radius-low: 0.3rem;
  --radius-medium: 0.8rem;
```

Replace with:

```css
  --radius-low: 0.3rem;
  --radius-medium: 0.8rem;

  --container-slot-sm: 7rem;
  --container-slot-md: 11rem;
  --container-slot-lg: 18rem;
```

These become Tailwind `max-w-slot-sm|md|lg` utilities (Tailwind v4 generates `max-w-*` from the `--container-*` namespace).

- [ ] **Step 2: Generalize `TableColumn` and drop `TableColumnKey`**

Replace the full contents of `src/components/ui/table/types.ts` with:

```ts
import type { Component } from "vue";

export const SocialNetwork = {
  LinkedIn: "linkedin",
  GitHub: "github",
  Instagram: "instagram",
  Facebook: "facebook",
  X: "x",
  WhatsApp: "whatsapp",
  GitLab: "gitlab",
  Behance: "behance",
  Dribbble: "dribbble",
  TikTok: "tiktok",
} as const;

export type SocialNetwork = (typeof SocialNetwork)[keyof typeof SocialNetwork];

export type CandidateStatus = "aprovado" | "reprovado";

export const Seniority = {
  Junior: "junior",
  Pleno: "pleno",
  Senior: "senior",
} as const;

export type Seniority = (typeof Seniority)[keyof typeof Seniority];

export interface SocialLink {
  network: SocialNetwork;
  url: string;
}

export interface Candidate {
  id: string | number;
  name: string;
  email: string;
  avatarUrl?: string;
  status: CandidateStatus;
  phone: string;
  networks?: SocialLink[];
  seniority: Seniority;
  experienceYears: number;
}

export interface TableColumn<T> {
  key: string;
  label: string;
  size?: "sm" | "md" | "lg";
  align?: "start" | "center";
  component: Component;
  props: (item: T) => Record<string, unknown>;
}
```

(`role`/`salaryExpectation` are added to `Candidate` in Task 2, not here.)

- [ ] **Step 3: Rewrite `grid.ts` to use CSS-var tiers instead of JS text measurement**

Replace the full contents of `src/components/ui/table/style/grid.ts` with:

```ts
import type { TableColumn } from '../types'

const HANDLE_WIDTH = '1.5rem'

const SIZE_VAR: Record<NonNullable<TableColumn<unknown>['size']>, string> = {
  sm: 'var(--container-slot-sm)',
  md: 'var(--container-slot-md)',
  lg: 'var(--container-slot-lg)',
}

export function gridTemplate<T>(columns: TableColumn<T>[], draggable = true) {
  const tracks = columns.map((column) => `minmax(min-content, ${SIZE_VAR[column.size ?? 'md']})`)
  return [...(draggable ? [HANDLE_WIDTH] : []), ...tracks].join(' ')
}
```

- [ ] **Step 4: Extract `TableHeader.vue`**

Create `src/components/ui/table/TableHeader.vue`:

```vue
<script setup lang="ts" generic="T">

import { CircleQuestionMark } from '@lucide/vue'

import type { TableColumn } from './types'

withDefaults(
  defineProps<{
    columns:             TableColumn<T>[]
    gridTemplateColumns: string
    draggable?:          boolean
  }>(),
  { draggable: true },
)

</script>

<template>
  <div class="grid items-center gap-4 rounded-medium bg-white px-4 py-3" :style="{ gridTemplateColumns }">
    <span v-if="draggable" />
    <div class="flex items-center gap-1 opacity-40 cursor-default select-none"
      :class="column.align === 'start' ? 'justify-start' : 'justify-center'"
      :key="column.key"
      v-for="column in columns"
    >
      <span class="text-small font-semibold text-black">{{ column.label }}</span>
      <CircleQuestionMark :size="14" class="text-black" stroke-width="2.8" />
    </div>
  </div>
</template>
```

- [ ] **Step 5: Make `Row.vue` fully generic**

Replace the full contents of `src/components/ui/table/Row.vue` with:

```vue
<script setup lang="ts" generic="T extends { id: string | number }">

import { Grip } from '@lucide/vue'

import type { TableColumn } from './types'

withDefaults(
  defineProps<{
    item:                 T
    columns:              TableColumn<T>[]
    gridTemplateColumns:  string
    draggable?:           boolean
  }>(),
  { draggable: true },
)

</script>

<template>
  <div class="grid items-center gap-4 rounded-medium bg-white px-4 py-3 select-none" :style="{ gridTemplateColumns }" draggable="false">
    <span v-if="draggable" class="drag-handle inline-flex cursor-grab items-center justify-center p-1 [-webkit-user-drag:none]" draggable="false">
      <Grip :size="16" class="pointer-events-none text-black/30" draggable="false" />
    </span>

    <div
      v-for="column in columns"
      :key="column.key"
      class="flex items-center"
      :class="column.align === 'start' ? 'justify-start' : 'justify-center'"
    >
      <component :is="column.component" v-bind="column.props(item)" />
    </div>

    <slot name="actions" :item="item" />
  </div>
</template>
```

Note: `Row.vue` no longer imports any field component (`CandidateField`, `StatusField`, etc.) — that knowledge now lives entirely in each page's column definitions.

- [ ] **Step 6: Make `Table.vue` generic, with optional drag and an actions slot**

Replace the full contents of `src/components/ui/table/Table.vue` with:

```vue
<script setup lang="ts" generic="T extends { id: string | number }">

import VueDraggable            from 'vuedraggable'
import { computed }            from 'vue'

import type { TableColumn }            from './types'
import      { gridTemplate }           from './style/grid'
import      { useDragGhostOpacityFix } from '@/lib/dragGhostOpacity'

import TableHeader from './TableHeader.vue'
import Row          from './Row.vue'

useDragGhostOpacityFix()

const props = withDefaults(
  defineProps<{
    columns:    TableColumn<T>[]
    items:      T[]
    draggable?: boolean
  }>(),
  { draggable: true },
)

const emit = defineEmits<{
  'update:items': [items: T[]]
}>()

const gridTemplateColumns = computed(() => gridTemplate(props.columns, props.draggable))

const rows = computed({
  get: () => props.items,
  set: (value: T[]) => emit('update:items', value),
})

</script>

<template>
  <div class="overflow-x-auto scrollbar-hide">
    <div class="flex min-w-fit flex-col gap-3">
      <TableHeader :columns="columns" :grid-template-columns="gridTemplateColumns" :draggable="props.draggable" />

      <VueDraggable
        v-if="props.draggable"
        v-model="rows"
        tag="div"
        item-key="id"
        handle=".drag-handle"
        :animation="150"
        :force-fallback="true"
        class="flex flex-col gap-2"
      >
        <template #item="{ element }">
          <Row :item="element" :columns="columns" :grid-template-columns="gridTemplateColumns">
            <template v-if="$slots.actions" #actions="slotProps">
              <slot name="actions" v-bind="slotProps" />
            </template>
          </Row>
        </template>
      </VueDraggable>

      <div v-else class="flex flex-col gap-2">
        <Row
          v-for="item in items"
          :key="item.id"
          :item="item"
          :columns="columns"
          :grid-template-columns="gridTemplateColumns"
          :draggable="false"
        >
          <template v-if="$slots.actions" #actions="slotProps">
            <slot name="actions" v-bind="slotProps" />
          </template>
        </Row>
      </div>
    </div>
  </div>
</template>
```

The `vuedraggable` import is renamed to `VueDraggable` (not `draggable`) specifically because the component now also has a `draggable` **prop** — using the same identifier for both the imported tag and the prop would shadow one of them in the template.

- [ ] **Step 7: Sync `CandidateField.vue`'s truncation width to the new tier tokens**

Edit `src/components/ui/table/fields/CandidateField.vue`. Find:

```
    <div class="max-w-56">
```

Replace with:

```
    <div class="max-w-slot-lg">
```

- [ ] **Step 8: Create the shared `candidateColumns()` factory**

Create `src/components/ui/table/columns/candidateColumns.ts`:

```ts
import type { TableColumn, Candidate } from '../types'

import CandidateField  from '../fields/CandidateField.vue'
import StatusField     from '../fields/StatusField.vue'
import PhoneField      from '../fields/PhoneField.vue'
import NetworkField    from '../fields/NetworkField.vue'
import SeniorityField  from '../fields/SeniorityField.vue'
import ExperienceField from '../fields/ExperienceField.vue'

export function candidateColumns(): TableColumn<Candidate>[] {
  return [
    {
      key: 'name',
      label: 'Nome',
      size: 'lg',
      align: 'start',
      component: CandidateField,
      props: (item) => ({ name: item.name, email: item.email, avatarUrl: item.avatarUrl }),
    },
    {
      key: 'status',
      label: 'Estado',
      size: 'sm',
      component: StatusField,
      props: (item) => ({ status: item.status }),
    },
    {
      key: 'phone',
      label: 'Telefone',
      size: 'md',
      component: PhoneField,
      props: (item) => ({ phone: item.phone }),
    },
    {
      key: 'network',
      label: 'Network',
      size: 'sm',
      component: NetworkField,
      props: (item) => ({ networks: item.networks }),
    },
    {
      key: 'experience',
      label: 'Tempo de experiência',
      size: 'sm',
      component: ExperienceField,
      props: (item) => ({ years: item.experienceYears }),
    },
    {
      key: 'seniority',
      label: 'Senioridade',
      size: 'sm',
      component: SeniorityField,
      props: (item) => ({ seniority: item.seniority }),
    },
  ]
}
```

(`role` and `salaryExpectation` columns are inserted in Task 2.)

- [ ] **Step 9: Update `CandidatesView.vue` to the new column contract**

Replace the full contents of `src/views/CandidatesView.vue` with:

```vue
<script setup lang="ts">

import { ref } from 'vue'
import Table    from '@/components/ui/table/Table.vue'

import { candidateColumns } from '@/components/ui/table/columns/candidateColumns'
import { SocialNetwork, Seniority, type Candidate } from '@/components/ui/table/types'

function toSocialLink(network: SocialNetwork) {
  return { network, url: `https://${network}.com` }
}

const columns = candidateColumns()

const candidates = ref<Candidate[]>([
  {
    id: 1,
    name: "Roberta Rocha",
    email: "roberta@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks: [SocialNetwork.LinkedIn, SocialNetwork.GitHub].map(toSocialLink),
    seniority: Seniority.Senior,
    experienceYears: 8,
  },
  {
    id: 2,
    name: "Lucas Almeida",
    email: "lucas@email.com",
    status: "aprovado",
    phone: "(+55) 11 98765-4321",
    networks: [SocialNetwork.LinkedIn, SocialNetwork.Instagram].map(toSocialLink),
    seniority: Seniority.Pleno,
    experienceYears: 4,
  },
  {
    id: 3,
    name: "Marina Souza",
    email: "marina@email.com",
    status: "reprovado",
    phone: "(+55) 11 99887-6655",
    networks: [SocialNetwork.GitHub].map(toSocialLink),
    seniority: Seniority.Junior,
    experienceYears: 1,
  },
])

</script>

<template>
  <main class="flex flex-col gap-6 p-8">
    <h1>Candidatos</h1>
    <Table :columns="columns" v-model:items="candidates" />
  </main>
</template>
```

(This will not type-check until Task 2 adds `role`/`salaryExpectation` — actually no, it type-checks fine now: `columns` here doesn't reference `role`/`salaryExpectation`, and `Candidate` doesn't require them yet at this point in the plan. This file is self-consistent as of Task 1.)

- [ ] **Step 10: Update `TestsView.vue`'s table demo to the new column contract**

Edit `src/views/TestsView.vue`. Find:

```ts
import { SocialNetwork, Seniority, type Candidate, type SocialLink, type TableColumn } from "../components/ui/table/types";
```

Replace with:

```ts
import { SocialNetwork, Seniority, type Candidate, type SocialLink } from "../components/ui/table/types";
import { candidateColumns } from "../components/ui/table/columns/candidateColumns";
```

Then find:

```ts
const columns: TableColumn[] = [
  { key: "name", label: "Nome", width: "2fr", align: "start" },
  { key: "status", label: "Estado" },
  { key: "phone", label: "Telefone" },
  { key: "network", label: "Network" },
  { key: "seniority", label: "Senioridade" },
  { key: "experience", label: "Experiência" },
];
```

Replace with:

```ts
const columns = candidateColumns();
```

- [ ] **Step 11: Confirm no dangling references**

Run: `grep -rn "TableColumnKey" src/`
Expected: no matches.

- [ ] **Step 12: Build and manually verify**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

Run: `npm run dev`, open the printed local URL in a browser.
- Visit `/candidatos`: table renders the 3 candidates with the same 6 columns as before (Nome, Estado, Telefone, Network, Tempo de experiência, Senioridade — note experience/seniority order is now swapped vs. before, matching the Filtragem mockup's column order), drag-and-drop reorder still works (grab the grip icon, drag a row, it reorders).
- Visit `/tests`: the "Tabela" section renders identically in shape to before.
- No console errors in either page.

- [ ] **Step 13: Commit**

```bash
git add src/index.css src/components/ui/table/types.ts src/components/ui/table/style/grid.ts src/components/ui/table/TableHeader.vue src/components/ui/table/Table.vue src/components/ui/table/Row.vue src/components/ui/table/fields/CandidateField.vue src/components/ui/table/columns/candidateColumns.ts src/views/CandidatesView.vue src/views/TestsView.vue
git commit -m "refactor: generalize Table/Row to a component+props column contract"
```

---

### Task 2: New generic field components + candidate `role`/`salaryExpectation`

**Files:**
- Create: `src/components/ui/table/fields/TextField.vue`
- Create: `src/components/ui/table/fields/CountField.vue`
- Create: `src/components/ui/table/fields/SalaryField.vue`
- Modify: `src/components/ui/table/types.ts`
- Modify: `src/components/ui/table/columns/candidateColumns.ts`
- Modify: `src/views/CandidatesView.vue`
- Modify: `src/views/TestsView.vue`

**Interfaces:**
- Consumes: `TableColumn<T>` and `candidateColumns()` from Task 1.
- Produces: `TextField.vue` (`{ value: string }`), `CountField.vue` (`{ count: number }`), `SalaryField.vue` (`{ amount: number }`) — all three reused later by Peneira columns (Task 6, Task 8).

- [ ] **Step 1: Create `TextField.vue`**

```vue
<script setup lang="ts">

defineProps<{
  value: string
}>()

</script>

<template>
  <span class="text-body font-medium text-black">{{ value }}</span>
</template>
```

- [ ] **Step 2: Create `CountField.vue`**

```vue
<script setup lang="ts">

defineProps<{
  count: number
}>()

</script>

<template>
  <span class="text-body font-medium text-black">{{ count }}</span>
</template>
```

- [ ] **Step 3: Create `SalaryField.vue`**

```vue
<script setup lang="ts">

import { computed } from 'vue'

const props = defineProps<{
  amount: number
}>()

const formatted = computed(() =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(props.amount),
)

</script>

<template>
  <span class="text-body font-medium text-black">{{ formatted }}</span>
</template>
```

- [ ] **Step 4: Extend `Candidate` with `role` and `salaryExpectation`**

Edit `src/components/ui/table/types.ts`. Find:

```ts
export interface Candidate {
  id: string | number;
  name: string;
  email: string;
  avatarUrl?: string;
  status: CandidateStatus;
  phone: string;
  networks?: SocialLink[];
  seniority: Seniority;
  experienceYears: number;
}
```

Replace with:

```ts
export interface Candidate {
  id: string | number;
  name: string;
  email: string;
  avatarUrl?: string;
  status: CandidateStatus;
  phone: string;
  networks?: SocialLink[];
  seniority: Seniority;
  experienceYears: number;
  role: string;
  salaryExpectation: number;
}
```

- [ ] **Step 5: Add `role` and `salaryExpectation` columns**

Edit `src/components/ui/table/columns/candidateColumns.ts`. Find:

```ts
import CandidateField  from '../fields/CandidateField.vue'
import StatusField     from '../fields/StatusField.vue'
import PhoneField      from '../fields/PhoneField.vue'
import NetworkField    from '../fields/NetworkField.vue'
import SeniorityField  from '../fields/SeniorityField.vue'
import ExperienceField from '../fields/ExperienceField.vue'
```

Replace with:

```ts
import CandidateField  from '../fields/CandidateField.vue'
import StatusField     from '../fields/StatusField.vue'
import PhoneField      from '../fields/PhoneField.vue'
import NetworkField    from '../fields/NetworkField.vue'
import TextField       from '../fields/TextField.vue'
import SalaryField     from '../fields/SalaryField.vue'
import SeniorityField  from '../fields/SeniorityField.vue'
import ExperienceField from '../fields/ExperienceField.vue'
```

Then find:

```ts
    {
      key: 'network',
      label: 'Network',
      size: 'sm',
      component: NetworkField,
      props: (item) => ({ networks: item.networks }),
    },
    {
      key: 'experience',
```

Replace with:

```ts
    {
      key: 'network',
      label: 'Network',
      size: 'sm',
      component: NetworkField,
      props: (item) => ({ networks: item.networks }),
    },
    {
      key: 'role',
      label: 'Cargo',
      size: 'md',
      component: TextField,
      props: (item) => ({ value: item.role }),
    },
    {
      key: 'salaryExpectation',
      label: 'Expectativa salarial',
      size: 'sm',
      component: SalaryField,
      props: (item) => ({ amount: item.salaryExpectation }),
    },
    {
      key: 'experience',
```

- [ ] **Step 6: Add `role`/`salaryExpectation` to `CandidatesView.vue`'s mock data**

Edit `src/views/CandidatesView.vue`. Find:

```ts
    seniority: Seniority.Senior,
    experienceYears: 8,
  },
  {
    id: 2,
```

Replace with:

```ts
    seniority: Seniority.Senior,
    experienceYears: 8,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 12000,
  },
  {
    id: 2,
```

Find:

```ts
    seniority: Seniority.Pleno,
    experienceYears: 4,
  },
  {
    id: 3,
```

Replace with:

```ts
    seniority: Seniority.Pleno,
    experienceYears: 4,
    role: "Desenvolvedor Backend",
    salaryExpectation: 8000,
  },
  {
    id: 3,
```

Find:

```ts
    seniority: Seniority.Junior,
    experienceYears: 1,
  },
])
```

Replace with:

```ts
    seniority: Seniority.Junior,
    experienceYears: 1,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 4500,
  },
])
```

- [ ] **Step 7: Add `role`/`salaryExpectation` to `TestsView.vue`'s mock data**

Edit `src/views/TestsView.vue`. There are 5 mock candidates (`id: 1` through `id: 5`), each ending with a `seniority`/`experienceYears` pair. Apply these 5 edits in order (each anchored on its `id:` line, so they're unambiguous even though some candidates share the same `seniority`/`experienceYears` values):

Find:

```ts
  {
    id: 1,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Junior,
    experienceYears: 1,
  },
```

Replace with:

```ts
  {
    id: 1,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Junior,
    experienceYears: 1,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 4000,
  },
```

Find:

```ts
  {
    id: 2,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Pleno,
    experienceYears: 4,
  },
```

Replace with:

```ts
  {
    id: 2,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Pleno,
    experienceYears: 4,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 7000,
  },
```

Find:

```ts
  {
    id: 3,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Senior,
    experienceYears: 8,
  },
```

Replace with:

```ts
  {
    id: 3,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "aprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Senior,
    experienceYears: 8,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 12000,
  },
```

Find:

```ts
  {
    id: 4,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "reprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Pleno,
    experienceYears: 3,
  },
```

Replace with:

```ts
  {
    id: 4,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "reprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Pleno,
    experienceYears: 3,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 6500,
  },
```

Find:

```ts
  {
    id: 5,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "reprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Junior,
    experienceYears: 1,
  },
]);
```

Replace with:

```ts
  {
    id: 5,
    name: "Roberta Rocha",
    email: "email@email.com",
    status: "reprovado",
    phone: "(+55) 11 91022-3479",
    networks,
    seniority: Seniority.Junior,
    experienceYears: 1,
    role: "Desenvolvedora Frontend",
    salaryExpectation: 3800,
  },
]);
```

- [ ] **Step 8: Build and manually verify**

Run: `npm run build`
Expected: succeeds with no TypeScript errors (this confirms every mock candidate object now satisfies the extended `Candidate` interface).

Run: `npm run dev`, visit `/candidatos` and `/tests`. Confirm both tables now show 8 columns: Nome, Estado, Telefone, Network, Cargo, Expectativa salarial, Tempo de experiência, Senioridade — with "Cargo" showing plain text and "Expectativa salarial" showing a `R$`-formatted amount (e.g. `R$ 12.000`). No console errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/ui/table/fields/TextField.vue src/components/ui/table/fields/CountField.vue src/components/ui/table/fields/SalaryField.vue src/components/ui/table/types.ts src/components/ui/table/columns/candidateColumns.ts src/views/CandidatesView.vue src/views/TestsView.vue
git commit -m "feat: add role and salary expectation candidate fields"
```

---

### Task 3: Button icon-only + color variant

**Files:**
- Modify: `src/components/ui/Icon.vue`
- Modify: `src/components/ui/Button.vue`
- Modify: `src/index.css`
- Modify: `src/views/TestsView.vue`

**Interfaces:**
- Produces: `IconName` (exported type), `Button.vue` props `{ text?, icon?: IconName, variant?: 'primary' | 'neutral', rounded?, disabled? }`.
- Consumes: nothing from earlier tasks.

- [ ] **Step 1: Export `IconName` from `Icon.vue`**

Edit `src/components/ui/Icon.vue`. Find:

```ts
type IconName = Exclude<keyof typeof icons, 'icons' | 'Icon' | 'createLucideIcon' | 'LUCIDE_CONTEXT' | 'setLucideProps' | 'useLucideProps'>
```

Replace with:

```ts
export type IconName = Exclude<keyof typeof icons, 'icons' | 'Icon' | 'createLucideIcon' | 'LUCIDE_CONTEXT' | 'setLucideProps' | 'useLucideProps'>
```

- [ ] **Step 2: Add the neutral-variant shadow token**

Edit `src/index.css`. Find:

```css
  --color-white:    #FFFFFF;
  --color-white-co: #F8F8F8;
  --color-gray:     #ECECEC;
  --color-black:    #191919;
```

Replace with:

```css
  --color-white:    #FFFFFF;
  --color-white-co: #F8F8F8;
  --color-gray:     #ECECEC;
  --color-gray-co:  #C4C4C4;
  --color-black:    #191919;
```

- [ ] **Step 3: Rewrite `Button.vue`**

Replace the full contents of `src/components/ui/Button.vue` with:

```vue
<script setup lang="ts">

import { computed } from 'vue'
import * as icons   from '@lucide/vue'

import type { IconName } from './Icon.vue'

const props = withDefaults(
  defineProps<{
    text?:     string
    icon?:     IconName
    variant?:  'primary' | 'neutral'
    rounded?:  boolean
    disabled?: boolean
  }>(),
  {
    variant:  'primary',
    disabled: false,
    rounded:  false,
  },
)

const iconComponent = computed(() => (props.icon ? icons[props.icon] : null))

</script>

<template>
  <button
    class="relative inline-flex press-shadow items-center justify-center gap-2 text-center font-semibold cursor-pointer"
    :class="[
      rounded ? 'rounded-full' : 'rounded-medium',
      icon && !text ? 'aspect-square p-2.5' : 'px-4 py-2',
      variant === 'neutral' ? 'bg-gray text-black/60' : 'bg-blue text-white',
    ]"
    :style="{ '--press-shadow-color': variant === 'neutral' ? 'var(--color-gray-co)' : 'var(--color-blue-co)' }"
    type="button"
    :disabled="disabled"
  >
    <component :is="iconComponent" v-if="iconComponent" :size="18" />
    <span v-if="text">{{ text }}</span>
  </button>
</template>
```

- [ ] **Step 4: Add an icon-button showcase to `TestsView.vue`**

Edit `src/views/TestsView.vue`. Find:

```vue
    <section class="flex flex-wrap gap-3">
      <Button text="Padrão" />
      <Button text="Perigo" />
      <Button text="Desabilitado" disabled />
    </section>
```

Replace with:

```vue
    <section class="flex flex-wrap items-center gap-3">
      <Button text="Padrão" />
      <Button text="Perigo" />
      <Button text="Desabilitado" disabled />
      <Button icon="Home" variant="primary" />
      <Button icon="Trash2" variant="neutral" />
    </section>
```

- [ ] **Step 5: Build and manually verify**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

Run: `npm run dev`, visit `/tests`. Confirm two new square icon buttons appear next to the text buttons: one blue (Home icon), one gray (Trash2 icon). Hover and click each — both should show the same press-shadow "sink" animation as the text buttons. No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Icon.vue src/components/ui/Button.vue src/index.css src/views/TestsView.vue
git commit -m "feat: add icon-only and neutral-variant Button modes"
```

---

### Task 4: `FilterChips.vue`

**Files:**
- Create: `src/components/ui/FilterChips.vue`
- Modify: `src/views/TestsView.vue`

**Interfaces:**
- Consumes: `Button.vue` (icon-only, `variant="neutral"`) from Task 3.
- Produces: `FilterChips.vue` — props `{ options: { key: string; label: string }[] }`, `v-model` of type `string[]` (active option keys).

- [ ] **Step 1: Create `FilterChips.vue`**

```vue
<script setup lang="ts">

import Button from './Button.vue'

defineProps<{
  options: { key: string; label: string }[]
}>()

const active = defineModel<string[]>({ default: () => [] })

function toggle(key: string) {
  active.value = active.value.includes(key)
    ? active.value.filter((activeKey) => activeKey !== key)
    : [...active.value, key]
}

</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      class="rounded-full px-4 py-2 text-center font-semibold cursor-pointer transition-all duration-150"
      :class="active.includes(option.key)
        ? 'press-shadow bg-blue text-white'
        : 'bg-gray text-black/40 hover:text-black/60'"
      :style="active.includes(option.key) ? { '--press-shadow-color': 'var(--color-blue-co)' } : {}"
      @click="toggle(option.key)"
    >
      {{ option.label }}
    </button>

    <Button icon="Filter" variant="neutral" rounded />
  </div>
</template>
```

- [ ] **Step 2: Add a `FilterChips` showcase to `TestsView.vue`**

Edit `src/views/TestsView.vue`. Find:

```ts
import Button    from "../components/ui/Button.vue";
import Input     from "../components/ui/Input.vue";
```

Replace with:

```ts
import Button      from "../components/ui/Button.vue";
import Input       from "../components/ui/Input.vue";
import FilterChips from "../components/ui/FilterChips.vue";
```

Find:

```ts
const name = ref("");
```

Replace with:

```ts
const name = ref("");
const activeFilterDemo = ref<string[]>(["a"]);
```

Find:

```vue
    <section class="flex flex-wrap items-center gap-4">
      <Icon name="Home" />
      <Icon name="Search" />
      <Icon name="Trash2" :size="28" />
    </section>
```

Replace with:

```vue
    <section class="flex flex-wrap items-center gap-4">
      <Icon name="Home" />
      <Icon name="Search" />
      <Icon name="Trash2" :size="28" />
    </section>

    <section class="flex flex-col gap-2">
      <h2>Filtros</h2>
      <FilterChips
        :options="[{ key: 'a', label: 'Opção A' }, { key: 'b', label: 'Opção B' }, { key: 'c', label: 'Opção C' }]"
        v-model="activeFilterDemo"
      />
    </section>
```

- [ ] **Step 3: Build and manually verify**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

Run: `npm run dev`, visit `/tests`. Confirm the new "Filtros" section shows 3 pills plus a gray funnel icon button. "Opção A" starts blue/active; clicking any pill toggles it between blue/active and gray/inactive; multiple pills can be active at once. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/FilterChips.vue src/views/TestsView.vue
git commit -m "feat: add FilterChips toggle-pill component"
```

---

### Task 5: Peneira domain types + mock service

**Files:**
- Create: `src/types/peneira.ts`
- Create: `src/service/Peneiras.ts`

**Interfaces:**
- Consumes: `Candidate`, `SocialNetwork`, `Seniority` from `src/components/ui/table/types.ts` (Task 1/2).
- Produces: `ProcessStatus` (const + type), `SelectiveProcess` interface, `listProcesses(): SelectiveProcess[]`, `getProcess(id): SelectiveProcess | undefined`, `getCandidatesForProcess(id): Candidate[]`.

- [ ] **Step 1: Create `src/types/peneira.ts`**

```ts
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
  jobTitle: string
  department: string
  status: ProcessStatus
  availableSlots: number
  participants: number
  role: string
  approvalLimit: number
}
```

- [ ] **Step 2: Create `src/service/Peneiras.ts`**

```ts
import { Seniority, SocialNetwork, type Candidate } from '@/components/ui/table/types'
import { ProcessStatus, type SelectiveProcess } from '@/types/peneira'

function toSocialLink(network: SocialNetwork) {
  return { network, url: `https://${network}.com` }
}

const PROCESSES: SelectiveProcess[] = [
  {
    id: 1,
    jobTitle: 'Desenvolvedor frontend',
    department: 'Plataforma de Recebíveis',
    status: ProcessStatus.EmColeta,
    availableSlots: 500,
    participants: 7,
    role: 'Desenvolvedores',
    approvalLimit: 5,
  },
  {
    id: 2,
    jobTitle: 'Desenvolvedor backend',
    department: 'Plataforma de Pagamentos',
    status: ProcessStatus.EmProcesso,
    availableSlots: 300,
    participants: 9,
    role: 'Desenvolvedores',
    approvalLimit: 4,
  },
  {
    id: 3,
    jobTitle: 'Analista de QA',
    department: 'Qualidade',
    status: ProcessStatus.Pausado,
    availableSlots: 150,
    participants: 3,
    role: 'QA',
    approvalLimit: 2,
  },
  {
    id: 4,
    jobTitle: 'Product Designer',
    department: 'Design',
    status: ProcessStatus.Encerrado,
    availableSlots: 200,
    participants: 6,
    role: 'Design',
    approvalLimit: 3,
  },
  {
    id: 5,
    jobTitle: 'Engenheiro de dados',
    department: 'Dados',
    status: ProcessStatus.Rascunho,
    availableSlots: 100,
    participants: 0,
    role: 'Dados',
    approvalLimit: 2,
  },
]

// Only process id 1 ships with a full candidate mock (it's the one used to
// demonstrate the approve/reject drag mechanic end to end, matching the
// design mockup: 5 approved + 2 rejected against an approvalLimit of 5).
// The other processes intentionally return an empty candidate list.
const CANDIDATES_BY_PROCESS: Record<string | number, Candidate[]> = {
  1: [
    { id: 101, name: 'Roberta Rocha', email: 'roberta@email.com', status: 'aprovado', phone: '(+55) 11 91022-3479', networks: [SocialNetwork.LinkedIn, SocialNetwork.GitHub].map(toSocialLink), seniority: Seniority.Junior, experienceYears: 1, role: 'Desenvolvedora Frontend', salaryExpectation: 4200 },
    { id: 102, name: 'Lucas Almeida', email: 'lucas@email.com', status: 'aprovado', phone: '(+55) 11 98765-4321', networks: [SocialNetwork.LinkedIn].map(toSocialLink), seniority: Seniority.Pleno, experienceYears: 4, role: 'Desenvolvedor Frontend', salaryExpectation: 7500 },
    { id: 103, name: 'Marina Souza', email: 'marina@email.com', status: 'aprovado', phone: '(+55) 11 99887-6655', networks: [SocialNetwork.GitHub].map(toSocialLink), seniority: Seniority.Senior, experienceYears: 8, role: 'Desenvolvedora Frontend', salaryExpectation: 13000 },
    { id: 104, name: 'Pedro Lima', email: 'pedro@email.com', status: 'aprovado', phone: '(+55) 11 93344-5566', networks: [SocialNetwork.LinkedIn, SocialNetwork.Instagram].map(toSocialLink), seniority: Seniority.Pleno, experienceYears: 3, role: 'Desenvolvedor Frontend', salaryExpectation: 6800 },
    { id: 105, name: 'Ana Paula', email: 'ana@email.com', status: 'aprovado', phone: '(+55) 11 95566-7788', networks: [SocialNetwork.GitHub, SocialNetwork.LinkedIn].map(toSocialLink), seniority: Seniority.Junior, experienceYears: 2, role: 'Desenvolvedora Frontend', salaryExpectation: 4500 },
    { id: 106, name: 'Bruno Costa', email: 'bruno@email.com', status: 'reprovado', phone: '(+55) 11 92233-4455', networks: [SocialNetwork.LinkedIn].map(toSocialLink), seniority: Seniority.Junior, experienceYears: 1, role: 'Desenvolvedor Frontend', salaryExpectation: 3900 },
    { id: 107, name: 'Carla Nunes', email: 'carla@email.com', status: 'reprovado', phone: '(+55) 11 96677-8899', networks: [SocialNetwork.GitHub].map(toSocialLink), seniority: Seniority.Pleno, experienceYears: 3, role: 'Desenvolvedora Frontend', salaryExpectation: 7000 },
  ],
}

export function listProcesses(): SelectiveProcess[] {
  return PROCESSES
}

export function getProcess(id: string | number): SelectiveProcess | undefined {
  return PROCESSES.find((process) => String(process.id) === String(id))
}

export function getCandidatesForProcess(id: string | number): Candidate[] {
  return CANDIDATES_BY_PROCESS[id] ?? []
}
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: succeeds with no TypeScript errors. (Nothing imports this module yet, so there is no visual check for this task — the build passing confirms the mock data satisfies both `SelectiveProcess` and `Candidate`.)

- [ ] **Step 3: Commit**

```bash
git add src/types/peneira.ts src/service/Peneiras.ts
git commit -m "feat: add SelectiveProcess type and Peneiras mock service"
```

---

### Task 6: Peneira field components

**Files:**
- Create: `src/components/ui/table/fields/JobTitleField.vue`
- Create: `src/components/ui/table/fields/ProcessStatusField.vue`

**Interfaces:**
- Consumes: `ProcessStatus` from `src/types/peneira.ts` (Task 5).
- Produces: `JobTitleField.vue` (`{ title: string; subtitle: string; to?: RouteLocationRaw }`), `ProcessStatusField.vue` (`{ status: ProcessStatus }`).

- [ ] **Step 1: Create `JobTitleField.vue`**

```vue
<script setup lang="ts">

import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  title:    string
  subtitle: string
  to?:      RouteLocationRaw
}>()

</script>

<template>
  <div class="max-w-slot-lg">
    <RouterLink
      v-if="to"
      :to="to"
      class="block truncate leading-4 text-[1.05rem] font-semibold text-black hover:text-blue transition-colors duration-150"
    >
      {{ title }}
    </RouterLink>
    <p v-else class="truncate leading-4 text-[1.05rem] font-semibold text-black">{{ title }}</p>
    <p class="truncate leading-4 text-small text-black/40">{{ subtitle }}</p>
  </div>
</template>
```

- [ ] **Step 2: Create `ProcessStatusField.vue`**

```vue
<script setup lang="ts">

import { computed } from 'vue'
import { ProcessStatus } from '@/types/peneira'

const props = defineProps<{
  status: ProcessStatus
}>()

const CONFIG: Record<ProcessStatus, { label: string; bg: string; text: string; shadowColor: string }> = {
  [ProcessStatus.Encerrado]:  { label: 'Encerrado',   bg: 'bg-red',    text: 'text-white',    shadowColor: 'var(--color-red-co)'    },
  [ProcessStatus.EmProcesso]: { label: 'Em processo', bg: 'bg-blue',   text: 'text-white',    shadowColor: 'var(--color-blue-co)'   },
  [ProcessStatus.Pausado]:    { label: 'Pausado',     bg: 'bg-yellow', text: 'text-white',    shadowColor: 'var(--color-yellow-co)' },
  [ProcessStatus.EmColeta]:   { label: 'Em coleta',   bg: 'bg-green',  text: 'text-white',    shadowColor: 'var(--color-green-co)'  },
  [ProcessStatus.Rascunho]:   { label: 'Rascunho',    bg: 'bg-gray',   text: 'text-black/60', shadowColor: 'var(--color-gray-co)'   },
}

const config = computed(() => CONFIG[props.status])

</script>

<template>
  <span
    class="inline-flex w-fit items-center px-3 py-1 rounded-low text-small font-semibold cursor-default select-none press-shadow"
    :class="[config.bg, config.text]"
    :style="{ '--press-shadow-color': config.shadowColor }"
  >
    {{ config.label }}
  </span>
</template>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: succeeds with no TypeScript errors. (Not yet wired into a page — verified visually in Task 8.)

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/table/fields/JobTitleField.vue src/components/ui/table/fields/ProcessStatusField.vue
git commit -m "feat: add JobTitleField and ProcessStatusField components"
```

---

### Task 7: `SelectionTable.vue` (dual-zone approve/reject drag)

**Files:**
- Create: `src/components/ui/table/SelectionTable.vue`
- Modify: `src/views/TestsView.vue`

**Interfaces:**
- Consumes: `TableHeader.vue`, `Row.vue`, `gridTemplate()` (Task 1), `Candidate`, `candidateColumns()` (Task 1/2).
- Produces: `SelectionTable.vue` — props `{ columns: TableColumn<Candidate>[]; items: Candidate[]; approvalLimit: number }`, emits `update:items`.

- [ ] **Step 1: Create `SelectionTable.vue`**

```vue
<script setup lang="ts">

import { ref, computed } from 'vue'
import VueDraggable       from 'vuedraggable'

import type { TableColumn, Candidate } from './types'
import      { gridTemplate }           from './style/grid'
import      { useDragGhostOpacityFix } from '@/lib/dragGhostOpacity'

import TableHeader from './TableHeader.vue'
import Row          from './Row.vue'

useDragGhostOpacityFix()

const props = defineProps<{
  columns:       TableColumn<Candidate>[]
  items:         Candidate[]
  approvalLimit: number
}>()

const emit = defineEmits<{
  'update:items': [items: Candidate[]]
}>()

const approved = ref<Candidate[]>(props.items.filter((item) => item.status === 'aprovado'))
const rejected = ref<Candidate[]>(props.items.filter((item) => item.status === 'reprovado'))

function syncStatuses() {
  approved.value.forEach((item) => { item.status = 'aprovado' })
  rejected.value.forEach((item) => { item.status = 'reprovado' })
  emit('update:items', [...approved.value, ...rejected.value])
}

const gridTemplateColumns = computed(() => gridTemplate(props.columns))

const approvedGroup = { name: 'selection', put: (to: { list: unknown[] }) => to.list.length < props.approvalLimit }
const rejectedGroup = { name: 'selection', put: true }

</script>

<template>
  <div class="overflow-x-auto scrollbar-hide">
    <div class="flex min-w-fit flex-col gap-3">
      <TableHeader :columns="columns" :grid-template-columns="gridTemplateColumns" />

      <div class="rounded-medium bg-blue/10 p-3">
        <VueDraggable
          v-model="approved"
          tag="div"
          item-key="id"
          handle=".drag-handle"
          :group="approvedGroup"
          :animation="150"
          :force-fallback="true"
          class="flex min-h-16 flex-col gap-2"
          @change="syncStatuses"
        >
          <template #item="{ element }">
            <Row :item="element" :columns="columns" :grid-template-columns="gridTemplateColumns" />
          </template>
        </VueDraggable>
      </div>

      <VueDraggable
        v-model="rejected"
        tag="div"
        item-key="id"
        handle=".drag-handle"
        :group="rejectedGroup"
        :animation="150"
        :force-fallback="true"
        class="flex flex-col gap-2"
        @change="syncStatuses"
      >
        <template #item="{ element }">
          <Row :item="element" :columns="columns" :grid-template-columns="gridTemplateColumns" />
        </template>
      </VueDraggable>
    </div>
  </div>
</template>
```

`approved`/`rejected` are seeded once from `props.items` and never reset by a watcher — Task 8 makes the routed views remount (via a router-view `:key`) whenever the underlying peneira changes, so a fresh mount always gets a fresh split. Status is never treated as static data here: every drag-driven `change` event on either list rewrites `status` on every item currently in that zone, then emits the merged array upward — `Row`/`StatusField` stay completely unaware that a "zone" concept exists.

- [ ] **Step 2: Add a `SelectionTable` showcase to `TestsView.vue`**

Edit `src/views/TestsView.vue`. Find:

```ts
import Table     from "../components/ui/table/Table.vue";
```

Replace with:

```ts
import Table          from "../components/ui/table/Table.vue";
import SelectionTable from "../components/ui/table/SelectionTable.vue";
```

Find:

```ts
const candidates = ref<Candidate[]>([
```

Replace with:

```ts
const selectionItems = ref<Candidate[]>([
  { id: 201, name: "Roberta Rocha", email: "email@email.com", status: "aprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Senior, experienceYears: 8, role: "Desenvolvedora Frontend", salaryExpectation: 12000 },
  { id: 202, name: "Lucas Almeida", email: "email@email.com", status: "aprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Pleno, experienceYears: 4, role: "Desenvolvedor Frontend", salaryExpectation: 8000 },
  { id: 203, name: "Marina Souza", email: "email@email.com", status: "reprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Junior, experienceYears: 1, role: "Desenvolvedora Frontend", salaryExpectation: 4000 },
  { id: 204, name: "Pedro Lima", email: "email@email.com", status: "reprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Pleno, experienceYears: 3, role: "Desenvolvedor Frontend", salaryExpectation: 6500 },
  { id: 205, name: "Ana Paula", email: "email@email.com", status: "reprovado", phone: "(+55) 11 91022-3479", networks, seniority: Seniority.Junior, experienceYears: 2, role: "Desenvolvedora Frontend", salaryExpectation: 4200 },
]);

const candidates = ref<Candidate[]>([
```

Find:

```vue
    <section class="flex flex-col gap-3">
      <h2>Tabela</h2>
      <Table :columns="columns" v-model:items="candidates" />
    </section>
```

Replace with:

```vue
    <section class="flex flex-col gap-3">
      <h2>Tabela</h2>
      <Table :columns="columns" v-model:items="candidates" />
    </section>

    <section class="flex flex-col gap-3">
      <h2>Seleção com aprovação (SelectionTable, limite 2)</h2>
      <SelectionTable :columns="columns" :items="selectionItems" :approval-limit="2" @update:items="selectionItems = $event" />
    </section>
```

- [ ] **Step 3: Build and manually verify**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

Run: `npm run dev`, visit `/tests`. Confirm the new "Seleção com aprovação" section shows a light-blue rounded box containing Roberta and Lucas (the 2 `aprovado` mocks), with Marina/Pedro/Ana below it (the 3 `reprovado` mocks), and each row shows the correct "Aprovado"/"Reprovado" badge matching its zone.
- Drag Marina (reprovado) up into the blue box: it should be **blocked** (the box already has 2 items = the limit) — Marina should snap back to the rejected list.
- Drag Roberta (aprovado) down out of the blue box into the rejected list: it moves, and its badge flips to "Reprovado".
- Now drag Marina up into the blue box again: it should succeed (the box has only 1 item now), and Marina's badge flips to "Aprovado".
No console errors during any of these drags.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/table/SelectionTable.vue src/views/TestsView.vue
git commit -m "feat: add SelectionTable dual-zone approve/reject drag component"
```

---

### Task 8: `PeneirasView.vue` + routing + sidebar

**Files:**
- Create: `src/views/PeneirasView.vue`
- Modify: `src/routes.ts`
- Modify: `src/components/ui/Sidebar.vue`
- Modify: `src/App.vue`

**Interfaces:**
- Consumes: `Table.vue` (Task 1), `Button.vue`/`FilterChips.vue` (Task 3/4), `JobTitleField.vue`/`ProcessStatusField.vue` (Task 6), `CountField.vue`/`TextField.vue` (Task 2), `listProcesses()` (Task 5).
- Produces: route `peneiras` at `/peneiras`.

- [ ] **Step 1: Create `PeneirasView.vue`**

```vue
<script setup lang="ts">

import { ref, computed } from 'vue'

import Table       from '@/components/ui/table/Table.vue'
import Button      from '@/components/ui/Button.vue'
import FilterChips from '@/components/ui/FilterChips.vue'

import JobTitleField      from '@/components/ui/table/fields/JobTitleField.vue'
import ProcessStatusField from '@/components/ui/table/fields/ProcessStatusField.vue'
import CountField         from '@/components/ui/table/fields/CountField.vue'
import TextField          from '@/components/ui/table/fields/TextField.vue'

import type { TableColumn }      from '@/components/ui/table/types'
import { ProcessStatus, type SelectiveProcess } from '@/types/peneira'
import { listProcesses }         from '@/service/Peneiras'

const processes = listProcesses()

const columns: TableColumn<SelectiveProcess>[] = [
  {
    key: 'jobTitle',
    label: 'Finalidade da vaga',
    size: 'lg',
    align: 'start',
    component: JobTitleField,
    props: (item) => ({
      title: item.jobTitle,
      subtitle: item.department,
      to: { name: 'peneira-filtragem', params: { id: item.id } },
    }),
  },
  {
    key: 'status',
    label: 'Estado',
    size: 'sm',
    component: ProcessStatusField,
    props: (item) => ({ status: item.status }),
  },
  {
    key: 'availableSlots',
    label: 'Disponíveis',
    size: 'sm',
    component: CountField,
    props: (item) => ({ count: item.availableSlots }),
  },
  {
    key: 'participants',
    label: 'Participantes',
    size: 'sm',
    component: CountField,
    props: (item) => ({ count: item.participants }),
  },
  {
    key: 'role',
    label: 'Cargo',
    size: 'md',
    component: TextField,
    props: (item) => ({ value: item.role }),
  },
]

const STATUS_OPTIONS = [
  { key: ProcessStatus.Encerrado,  label: 'Encerrados' },
  { key: ProcessStatus.EmProcesso, label: 'Em processo' },
  { key: ProcessStatus.Pausado,    label: 'Pausados' },
  { key: ProcessStatus.EmColeta,   label: 'Em coleta' },
  { key: ProcessStatus.Rascunho,   label: 'Rascunhos' },
]

const activeStatuses = ref<string[]>(STATUS_OPTIONS.map((option) => option.key))

const filteredProcesses = computed(() =>
  processes.filter((process) => activeStatuses.value.includes(process.status)),
)

</script>

<template>
  <main class="flex flex-col gap-6 p-8">
    <div class="flex items-center gap-3">
      <h1>Processos seletivos</h1>
      <Button icon="LayoutGrid" variant="primary" />
    </div>

    <FilterChips :options="STATUS_OPTIONS" v-model="activeStatuses" />

    <Table :columns="columns" :items="filteredProcesses" :draggable="false">
      <template #actions>
        <div class="flex items-center gap-3 pl-2">
          <Button icon="Trash2" variant="neutral" />
          <Button icon="EllipsisVertical" variant="neutral" />
        </div>
      </template>
    </Table>
  </main>
</template>
```

- [ ] **Step 2: Register the `/peneiras` route**

Edit `src/routes.ts`. Find:

```ts
    {
      path: '/candidatos',
      name: 'candidatos',
      component: () => import('@/views/CandidatesView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
```

Replace with:

```ts
    {
      path: '/candidatos',
      name: 'candidatos',
      component: () => import('@/views/CandidatesView.vue'),
    },
    {
      path: '/peneiras',
      name: 'peneiras',
      component: () => import('@/views/PeneirasView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
```

- [ ] **Step 3: Add the sidebar link**

Edit `src/components/ui/Sidebar.vue`. Find:

```ts
import { PanelLeftClose, PanelLeftOpen, Home } from '@lucide/vue'
```

Replace with:

```ts
import { PanelLeftClose, PanelLeftOpen, Home, ListChecks } from '@lucide/vue'
```

Find:

```vue
    <RouterLink to="/candidatos" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
      <Home :size="20" />
    </RouterLink>
```

Replace with:

```vue
    <RouterLink to="/candidatos" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
      <Home :size="20" />
    </RouterLink>

    <RouterLink to="/peneiras" class="text-black/40 hover:text-black/80 transition-colors duration-300" active-class="text-black">
      <ListChecks :size="20" />
    </RouterLink>
```

- [ ] **Step 4: Show the sidebar on `/peneiras*` and remount routed views on navigation**

Edit `src/App.vue`. Find:

```ts
const router  = useRoute();
const login   = ["/login", "/recuperar-senha"];
const sidebar = ["/candidatos"];
```

Replace with:

```ts
const router  = useRoute();
const login   = ["/login", "/recuperar-senha"];
const sidebar = ["/candidatos", "/peneiras"];
```

Find:

```vue
      <Sidebar v-if="sidebar.includes(router.path)" />
      <RouterView class="flex-1 overflow-y-auto" />
```

Replace with:

```vue
      <Sidebar v-if="sidebar.some((path) => router.path === path || router.path.startsWith(path + '/'))" />
      <RouterView :key="router.fullPath" class="flex-1 overflow-y-auto" />
```

(The `:key="router.fullPath"` forces a fresh component mount on every route change, including `/peneiras/1` → `/peneiras/2` — this is what lets `SelectionTable`, in Task 7, safely seed its approved/rejected split once at mount instead of re-watching props.)

- [ ] **Step 5: Build and manually verify**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

Run: `npm run dev`, visit `/peneiras`. Confirm:
- 5 mock processes render, each with a two-line title/subtitle, a colored status badge (Fechado-style badges: red "Encerrado", blue "Em processo", yellow "Pausado", green "Em coleta", gray "Rascunho"), numeric "Disponíveis"/"Participantes", and "Cargo" text.
- All 5 status chips at the top start active (blue); deactivating one hides the matching row(s) (e.g. click "Rascunhos" off — the "Engenheiro de dados" row disappears).
- The row has no drag handle (no grip icon) and trailing trash/kebab icon buttons appear at the end of each row (no-op on click).
- The sidebar is visible on this page, with a new second icon link.
- Clicking the "Desenvolvedor frontend" title attempts navigation to `/peneiras/1` — this is expected to be a broken/unmatched route until Task 9 adds it; a console warning here is expected and will disappear after Task 9.

- [ ] **Step 6: Commit**

```bash
git add src/views/PeneirasView.vue src/routes.ts src/components/ui/Sidebar.vue src/App.vue
git commit -m "feat: add Processos seletivos list page"
```

---

### Task 9: `FiltragemView.vue` + routing

**Files:**
- Create: `src/views/FiltragemView.vue`
- Modify: `src/routes.ts`

**Interfaces:**
- Consumes: `SelectionTable.vue` (Task 7), `FilterChips.vue`/`Button.vue` (Task 3/4), `candidateColumns()` (Task 1/2), `getProcess()`/`getCandidatesForProcess()` (Task 5).
- Produces: route `peneira-filtragem` at `/peneiras/:id`.

- [ ] **Step 1: Create `FiltragemView.vue`**

```vue
<script setup lang="ts">

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import SelectionTable from '@/components/ui/table/SelectionTable.vue'
import FilterChips     from '@/components/ui/FilterChips.vue'
import Button          from '@/components/ui/Button.vue'

import { candidateColumns } from '@/components/ui/table/columns/candidateColumns'
import type { Candidate }   from '@/components/ui/table/types'
import { getProcess, getCandidatesForProcess } from '@/service/Peneiras'

const route = useRoute()
const processId = route.params.id as string

const process = getProcess(processId)
const candidates = ref<Candidate[]>(getCandidatesForProcess(processId))

const allColumns = candidateColumns()
const COLUMN_OPTIONS = allColumns.map((column) => ({ key: column.key, label: column.label }))

const activeColumnsRaw = ref<string[]>(['name', 'status', 'phone', 'network'])
const activeColumns = computed({
  get: () => activeColumnsRaw.value,
  set: (value: string[]) => {
    activeColumnsRaw.value = value.includes('name') ? value : ['name', ...value]
  },
})

const visibleColumns = computed(() =>
  allColumns.filter((column) => activeColumns.value.includes(column.key)),
)

</script>

<template>
  <main v-if="process" class="flex flex-col gap-6 p-8">
    <div class="flex items-center gap-3">
      <h1>{{ process.jobTitle }}</h1>
      <Button icon="EllipsisVertical" variant="neutral" />
      <div class="ml-auto flex items-center gap-3">
        <Button icon="UserPlus" variant="primary" />
        <Button icon="Download" variant="primary" />
        <Button icon="Share2"   variant="primary" />
      </div>
    </div>
    <h3>{{ process.department }}</h3>

    <FilterChips :options="COLUMN_OPTIONS" v-model="activeColumns" />

    <SelectionTable
      :columns="visibleColumns"
      :items="candidates"
      :approval-limit="process.approvalLimit"
      @update:items="candidates = $event"
    />
  </main>
</template>
```

Because `activeColumns` is a computed with a setter that always re-adds `'name'`, the "Nome" chip in `FilterChips` can be clicked but its effective state never changes — `visibleColumns` always includes it. This keeps the "always on" rule inside the page (which owns the business rule) rather than inside `FilterChips` (which stays a generic toggle list).

- [ ] **Step 2: Register the `/peneiras/:id` route**

Edit `src/routes.ts`. Find:

```ts
    {
      path: '/peneiras',
      name: 'peneiras',
      component: () => import('@/views/PeneirasView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
```

Replace with:

```ts
    {
      path: '/peneiras',
      name: 'peneiras',
      component: () => import('@/views/PeneirasView.vue'),
    },
    {
      path: '/peneiras/:id',
      name: 'peneira-filtragem',
      component: () => import('@/views/FiltragemView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
```

- [ ] **Step 3: Build and manually verify**

Run: `npm run build`
Expected: succeeds with no TypeScript errors.

Run: `npm run dev`, visit `/peneiras`, click "Desenvolvedor frontend". Confirm:
- URL changes to `/peneiras/1`, no console warning this time.
- Header shows "Desenvolvedor frontend" as `h1`, "Plataforma de Recebíveis" as `h3`, a kebab icon button next to the title, and 3 blue icon buttons (add person / download / share) right-aligned.
- Column chips show Nome/Estado/Telefone/Network active (blue), the rest (Cargo, Expectativa salarial, Tempo de experiência, Senioridade) inactive (gray).
- Table shows a light-blue rounded box containing exactly 5 rows (Roberta, Lucas, Marina, Pedro, Ana — all "Aprovado"), with Bruno and Carla ("Reprovado") below it, outside the box.
- Click "Cargo" chip: a "Cargo" column appears in the table for every row. Click "Nome" chip: nothing changes (name stays visible, matching the "always on" rule).
- Drag Bruno (reprovado, below the box) up into the blue box: blocked (box is already at the 5-item `approvalLimit`) — Bruno snaps back.
- Drag Roberta (inside the box) down into the rejected list below: succeeds, her badge flips to "Reprovado".
- Drag Bruno up into the box again: succeeds now (box has 4/5), his badge flips to "Aprovado".
- Navigate back to `/peneiras` and confirm it still renders correctly (regression check for the router-view `:key` change from Task 8).

- [ ] **Step 4: Commit**

```bash
git add src/views/FiltragemView.vue src/routes.ts
git commit -m "feat: add Filtragem de peneira page with approve/reject drag"
```

---

### Task 10: End-to-end regression pass

**Files:** none (verification only).

**Interfaces:** none — this task only exercises what Tasks 1–9 built.

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: succeeds with no TypeScript errors, no warnings about unresolved imports.

- [ ] **Step 2: Full manual walkthrough**

Run: `npm run dev` and, in the browser:

1. `/candidatos` — table renders 3 candidates, 8 columns, drag-reorder still works, no console errors.
2. `/tests` — every showcase section renders without console errors: Buttons (incl. the 2 icon buttons), Input, Icons, Filtros (FilterChips), Tabela, Seleção com aprovação (SelectionTable, including the cap-blocking drag from Task 7's verification), Lista.
3. `/peneiras` — 5 processes, status chip filtering works, sidebar visible, trash/kebab icons present and inert.
4. `/peneiras/1` (reached by clicking the job title from `/peneiras`) — header buttons present, column chips work, approve/reject drag works both directions and respects the cap, as verified in Task 9.
5. `/peneiras/2` — reached by navigating back to `/peneiras` and clicking "Desenvolvedor backend": page mounts fresh (title/department match process 2), approved/rejected zones are both empty (process 2 has no mock candidates — expected, per Task 5's note), no console errors or stale data leaking over from process 1.
6. Resize the browser window narrow (~500px): every table (`/candidatos`, `/peneiras`, `/peneiras/1`) scrolls horizontally within its own container instead of breaking the page layout.

- [ ] **Step 3: Final check for leftover dead code**

Run: `grep -rn "TableColumnKey\|contentWidth\|widestChars" src/`
Expected: no matches (confirms the old JS-measurement code from `grid.ts` was fully removed in Task 1, not left dangling elsewhere).

No commit for this task — it's a verification pass. If any step surfaces a bug, fix it in the relevant file, re-run the affected verification steps, then commit with a message describing the fix (e.g. `fix: <description>`).
