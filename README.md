# HiringSys Web

Interface web do HiringSys, construída com Vue 3, TypeScript, Vite e Tailwind
CSS. O Vue foi escolhido por oferecer componentes reutilizáveis, reatividade
simples e uma boa estrutura para uma SPA sem o peso de um framework maior.

## Como executar

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env` e informe a URL da API:

```properties
VITE_API_BASE_URL=http://localhost:8080
```

Quando a variável não está definida, o projeto usa dados locais de demonstração.
Quando ela está definida, erros HTTP reais são exibidos e não são substituídos
silenciosamente por mocks.

## Requisitos demonstrados

A tela **Funcionários** centraliza o CRUD solicitado:

| Ação na interface | Comunicação com a API |
| --- | --- |
| Cadastrar funcionário | `POST /funcionarios` |
| Listar e pesquisar | `GET /funcionarios?nome=&cargo=&status=` |
| Consultar detalhes | `GET /funcionarios/{id}` |
| Editar todos os dados | `PUT /funcionarios/{id}` |
| Atualização rápida | `PATCH /funcionarios/{id}` |
| Excluir | `DELETE /funcionarios/{id}` |
| Exibir indicadores | `GET /funcionarios/indicadores` |

Também existem as telas de processos seletivos, importação por planilha,
organização de aprovados, arquivos de currículo, autenticação e recuperação de
senha.

## Decisões técnicas

- A comunicação usa `fetch` por meio de um cliente centralizado que adiciona o
  token JWT e converte respostas de erro da API em mensagens compreensíveis.
- Os formulários usam validação nativa e os DTOs TypeScript refletem os contratos
  do Spring Boot.
- A navegação é lateral em desktop e inferior em telas pequenas.
- Listas, filtros, formulários e ações têm estados de carregamento, vazio, erro e
  confirmação para evitar operações acidentais.

As principais dificuldades foram conciliar o modelo relacional de cargos e
processos com o CRUD simples do enunciado, preservar os cinco métodos HTTP de
forma visível e adaptar tabelas com muitas ações para dispositivos móveis.

## Validação

```bash
npm run build
```

O comando executa a verificação de tipos do Vue/TypeScript e gera o bundle de
produção com o Vite.
