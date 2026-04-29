# Feature: Comunicados

**Agente responsável:** content-architect
**Data de mapeamento:** 2026-04-23
**Status:** Especificado — aguardando implementacao backend + frontend

---

## 1. Visao Geral

Comunicados e o canal oficial de comunicacao interna da Nobel Capital. Permite que equipes de RH e Diretoria publiquem avisos, noticias e informacoes relevantes para todos os colaboradores autenticados no INTRA.

---

## 2. Paginas e Rotas

| Rota | Componente | Acesso | Descricao |
|------|-----------|--------|-----------|
| `/comunicados` | `ComunicadosPage` | Todos | Listagem com filtros rapidos por categoria |
| `/comunicados/[id]` | `ComunicadoDetailPage` | Todos | Detalhe completo do comunicado |
| `/comunicados/novo` | `NovoComunicadoPage` | RH / Diretoria | Formulario de criacao |
| `/comunicados/[id]/editar` | `EditarComunicadoPage` | RH / Diretoria (proprio autor ou admin) | Formulario de edicao |

### Comportamento das rotas protegidas

- `/comunicados/novo` e `/comunicados/[id]/editar`: se o usuario nao tiver role `rh` ou `diretoria`, retornar HTTP 403 no Server Component (via `requireRole()`). Nao redirecionar silenciosamente — exibir pagina de "sem permissao" com mensagem clara.
- Comunicados com `data_expiracao` no passado sao excluidos da listagem padrao. Para acessa-los, e preciso URL direta com `/comunicados/[id]` (exibe banner de "comunicado expirado").

---

## 3. Schema de Dados

### Entidade `Comunicado`

| Campo | Tipo (SQLite/D1) | Obrigatorio | Descricao |
|-------|-----------------|------------|-----------|
| `id` | `TEXT` (ULID) | Sim | Identificador unico. Usar ULID para ordenacao cronologica sem UUID aleatoriedad. Ex: `01HVAB...` |
| `titulo` | `TEXT` | Sim | Titulo do comunicado. Max 200 caracteres. |
| `conteudo` | `TEXT` | Sim | Corpo do comunicado em **Markdown**. Renderizado no frontend com `react-markdown` + `rehype-sanitize`. |
| `categoria` | `TEXT` | Sim | Enum: `RH`, `Produtos`, `PJ2` |
| `fixado` | `INTEGER` (boolean) | Sim | `1` = fixado no topo da listagem. Default `0`. |
| `autor_email` | `TEXT` | Sim | Email do autor extraido do JWT. Ex: `rh@nobelcapital.com.br` |
| `autor_nome` | `TEXT` | Sim | Nome do autor extraido do JWT. Denormalizado para exibicao rapida. |
| `data_criacao` | `TEXT` (ISO 8601) | Sim | Timestamp de criacao. Gerado no Worker. Ex: `2026-04-23T14:30:00Z` |
| `data_atualizacao` | `TEXT` (ISO 8601) | Sim | Atualizado a cada edicao. |
| `data_expiracao` | `TEXT` (ISO 8601) | Nao | Se preenchido, comunicado deixa de aparecer na listagem apos essa data/hora. |
| `ativo` | `INTEGER` (boolean) | Sim | Soft delete: `0` = arquivado, `1` = ativo. Default `1`. |

> **Decisao de formato de conteudo:** Markdown foi escolhido em vez de rich text (HTML/Tiptap) por ser mais simples de armazenar, auditar e renderizar no edge. Para uma V2, pode-se migrar para um editor como Tiptap com saida HTML sanitizado.

### Entidade `UserRole`

Gerencia as permissoes de criacao/edicao de comunicados. Separada da tabela `users` para permitir mudancas de role sem recriar sessao.

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|------------|-----------|
| `email` | `TEXT` | Sim | PK. Email corporativo do usuario. |
| `role` | `TEXT` | Sim | Enum: `rh`, `diretoria`, `membro` |
| `concedido_por` | `TEXT` | Sim | Email do admin que concedeu a role. |
| `criado_em` | `TEXT` (ISO 8601) | Sim | Timestamp de concessao. |

---

## 4. Permissoes e Roles

### Como identificar a role do usuario logado

O Cloudflare Access injeta um JWT com `email` e `name` do usuario. O INTRA armazena esse email em `SessionPayload.username` (via cookie `intra_session`). A verificacao de role e feita consultando a tabela `user_roles` no D1.

```
Email do JWT → consulta user_roles WHERE email = ? → retorna role
```

### Roles e capacidades

| Role | Pode visualizar | Pode criar | Pode editar | Pode arquivar |
|------|----------------|-----------|------------|--------------|
| `membro` | Sim (todos ativos) | Nao | Nao | Nao |
| `rh` | Sim | Sim | Sim (proprios) | Sim (proprios) |
| `diretoria` | Sim | Sim | Sim (todos) | Sim (todos) |

> **Regra pratica de identificacao:** A abordagem recomendada e a tabela `user_roles` no banco (descrita acima). Uma alternativa mais simples para V1 seria checar o prefixo do email (ex: `email.startsWith('rh@')` ou `email.includes('diretoria')`), mas isso e fragil. A tabela garante flexibilidade e auditabilidade.

### Helper de permissao no Worker (Hono middleware)

```typescript
// server/src/middleware/requireRole.ts
export function requireRole(...roles: Role[]) {
  return async (c: Context, next: Next) => {
    const email = c.get('userEmail') // injetado pelo middleware de auth CF Access
    const userRole = await db.query.userRoles.findFirst({
      where: eq(userRoles.email, email),
    })
    if (!userRole || !roles.includes(userRole.role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  }
}
```

---

## 5. Navegacao

### Posicao na Sidebar

- **Secao:** Operacional (segunda secao, abaixo de "Principal")
- **Posicao dentro da secao:** 2o item (entre "Documentos" e "Automacoes") — ja esta posicionado assim no `Sidebar.tsx` atual
- **Badge dinamico:** exibir contagem de comunicados ativos nao lidos pelo usuario (requer tabela `comunicado_leituras` na V2)

### Icone Lucide sugerido

```
import { Megaphone } from 'lucide-react'
```

`Megaphone` (megafone) e semanticamente mais preciso para comunicados institucionais do que o icone de "bell" (notificacao) atualmente usado no prototipo. Alternativas: `Newspaper`, `BellRing`.

### Breadcrumbs

| Pagina | Breadcrumb |
|--------|-----------|
| `/comunicados` | Inicio / **Comunicados** |
| `/comunicados/[id]` | Inicio / Comunicados / **[titulo abreviado]** |
| `/comunicados/novo` | Inicio / Comunicados / **Novo comunicado** |
| `/comunicados/[id]/editar` | Inicio / Comunicados / [titulo] / **Editar** |

---

## 6. Estados Visuais

### Pagina de listagem `/comunicados`

| Estado | Descricao visual |
|--------|----------------|
| **Carregando** | Skeleton com 4 linhas no lugar das cards de comunicado (usar `animate-pulse` do Tailwind) |
| **Com dados** | Lista de cards com avatar do autor, tag colorida, titulo, preview e data |
| **Fixado no topo** | Card destacado com barra dourada `#B8963E` no topo e badge "📌 Fixado" |
| **Lista vazia (filtro ativo)** | Mensagem: "Nenhum comunicado em [categoria]." com icone vazio |
| **Lista vazia (sem dados)** | Mensagem: "Nenhum comunicado publicado ainda." com CTA para "Novo comunicado" (visivel apenas para RH/Diretoria) |
| **Erro de rede** | Banner vermelho discreto: "Nao foi possivel carregar os comunicados. Tente novamente." com botao "Tentar novamente" |
| **Botao 'Novo Comunicado' — sem permissao** | Botao nao e renderizado. Nao exibir botao desabilitado — simplesmente omitir para usuarios `membro`. |

### Pagina de detalhe `/comunicados/[id]`

| Estado | Descricao visual |
|--------|----------------|
| **Carregando** | Skeleton do titulo + paragrafos |
| **Encontrado e ativo** | Titulo, tag, autor, data, conteudo Markdown renderizado |
| **Expirado** | Banner amarelo no topo: "Este comunicado expirou em [data] e nao esta mais na listagem ativa." |
| **Arquivado (ativo=0)** | Banner cinza: "Este comunicado foi arquivado." |
| **Nao encontrado** | Pagina 404 padrao do INTRA |

### Formulario de criacao/edicao

| Estado | Descricao visual |
|--------|----------------|
| **Sem permissao** | Pagina exibe: "Voce nao tem permissao para criar comunicados. Entre em contato com o RH." |
| **Idle** | Formulario vazio com placeholders |
| **Submetendo** | Botao "Publicar" mostra spinner e fica desabilitado |
| **Sucesso** | Redireciona para `/comunicados/[id]` recem-criado com toast: "Comunicado publicado com sucesso!" |
| **Erro de validacao** | Campos com erro ficam com borda vermelha e mensagem inline abaixo |
| **Erro de servidor** | Toast de erro: "Erro ao salvar. Tente novamente." |

---

## 7. Nomenclatura Oficial

### Entidade

| Contexto | Texto |
|---------|-------|
| Singular | Comunicado |
| Plural | Comunicados |
| Slug URL | `comunicados` |
| Nome da tabela D1 | `comunicados` |
| Nome do tipo TypeScript | `Comunicado` |

### Labels de botoes e acoes

| Acao | Label |
|------|-------|
| Abrir formulario de criacao | `+ Novo comunicado` |
| Salvar novo comunicado | `Publicar` |
| Salvar edicao | `Salvar alteracoes` |
| Arquivar | `Arquivar` |
| Confirmar arquivamento | `Sim, arquivar` |
| Cancelar | `Cancelar` |
| Voltar para listagem | `← Comunicados` |
| Filtro "sem filtro" | `Todos` |
| Categoria RH | `RH` |
| Categoria Produtos | `Produtos` |
| Categoria PJ2 | `PJ2` |
| Comunicado fixado | `📌 Fixado` |
| Indicador de nao lido | ponto dourado `●` ao lado do titulo |

---

## 8. Campos do Formulario de Criacao/Edicao

| Campo | Componente | Validacao |
|-------|-----------|----------|
| Titulo | `<input type="text">` | Obrigatorio. Min 5, max 200 caracteres. |
| Categoria | `<select>` (RH / Produtos / PJ2) | Obrigatorio. |
| Conteudo | `<textarea>` com preview Markdown em painel lateral | Obrigatorio. Min 20 caracteres. |
| Data de expiracao | `<input type="datetime-local">` | Opcional. Deve ser data futura se preenchida. |
| Fixado | `<input type="checkbox">` | Opcional. Default desmarcado. |

> O autor e preenchido automaticamente pelo servidor a partir do JWT — nao e exposto no formulario.

---

## 9. API Endpoints (Cloudflare Worker / Hono)

Base URL: `api.intra.nobelcapital.com.br/v1`

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| `GET` | `/comunicados` | Todos | Lista comunicados ativos (nao expirados). Suporta `?categoria=RH` e `?page=1`. |
| `GET` | `/comunicados/:id` | Todos | Detalhe de um comunicado (incluindo expirados/arquivados). |
| `POST` | `/comunicados` | RH / Diretoria | Cria novo comunicado. Body validado com Zod. |
| `PATCH` | `/comunicados/:id` | RH / Diretoria | Atualiza campos do comunicado. |
| `DELETE` | `/comunicados/:id` | RH / Diretoria | Soft delete: define `ativo = 0`. |

### Schema Zod para criacao (POST)

```typescript
// server/src/routes/comunicados.ts
const CreateComunicadoSchema = z.object({
  titulo: z.string().min(5).max(200),
  conteudo: z.string().min(20),
  categoria: z.enum(['RH', 'Produtos', 'PJ2']),
  fixado: z.boolean().default(false),
  data_expiracao: z.string().datetime().optional().nullable(),
})
```

---

## 10. SQL Schema Inicial (D1 / SQLite)

```sql
-- Tabela principal de comunicados
CREATE TABLE IF NOT EXISTS comunicados (
  id               TEXT PRIMARY KEY,                        -- ULID
  titulo           TEXT NOT NULL,
  conteudo         TEXT NOT NULL,                           -- Markdown
  categoria        TEXT NOT NULL                            -- 'RH' | 'Produtos' | 'PJ2'
                   CHECK (categoria IN ('RH', 'Produtos', 'PJ2')),
  fixado           INTEGER NOT NULL DEFAULT 0,              -- boolean: 0 | 1
  autor_email      TEXT NOT NULL,
  autor_nome       TEXT NOT NULL,
  data_criacao     TEXT NOT NULL,                           -- ISO 8601
  data_atualizacao TEXT NOT NULL,                           -- ISO 8601
  data_expiracao   TEXT,                                    -- ISO 8601, nullable
  ativo            INTEGER NOT NULL DEFAULT 1               -- soft delete: 0 | 1
);

-- Indices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_comunicados_categoria
  ON comunicados (categoria);

CREATE INDEX IF NOT EXISTS idx_comunicados_ativo_expiracao
  ON comunicados (ativo, data_expiracao);

CREATE INDEX IF NOT EXISTS idx_comunicados_fixado
  ON comunicados (fixado, data_criacao DESC);

-- Tabela de roles de usuarios
CREATE TABLE IF NOT EXISTS user_roles (
  email          TEXT PRIMARY KEY,
  role           TEXT NOT NULL
                 CHECK (role IN ('rh', 'diretoria', 'membro')),
  concedido_por  TEXT NOT NULL,
  criado_em      TEXT NOT NULL                              -- ISO 8601
);

-- Seed inicial de roles (executar uma vez em producao)
-- INSERT INTO user_roles (email, role, concedido_por, criado_em) VALUES
--   ('rh@nobelcapital.com.br',        'rh',        'rafael.brandao@nobelcapital.com.br', '2026-04-23T00:00:00Z'),
--   ('rafael.brandao@nobelcapital.com.br', 'diretoria', 'rafael.brandao@nobelcapital.com.br', '2026-04-23T00:00:00Z');

-- (V2) Tabela de leituras para rastrear "nao lidos"
-- CREATE TABLE IF NOT EXISTS comunicado_leituras (
--   comunicado_id  TEXT NOT NULL REFERENCES comunicados(id),
--   usuario_email  TEXT NOT NULL,
--   lido_em        TEXT NOT NULL,
--   PRIMARY KEY (comunicado_id, usuario_email)
-- );
```

---

## 11. Migration File

O arquivo de migration para o D1 deve ser salvo em:

```
server/migrations/0002_comunicados.sql
```

Convencao de nomenclatura: `{numero_sequencial}_{descricao}.sql`, alinhada com o Wrangler D1 migrations.

---

## 12. Decisoes de Arquitetura

### Por que ULID e nao UUID?

ULIDs sao lexicograficamente ordenados por tempo de criacao — isso permite `ORDER BY id DESC` sem precisar de index extra em `data_criacao`, e evita a fragmentacao de B-tree que UUIDs aleatorios causam no SQLite.

### Por que Markdown e nao HTML/rich text?

1. Seguro: sem risco de XSS se sanitizado corretamente com `rehype-sanitize`
2. Simples: `<textarea>` nativo, sem dependencia de editor WYSIWYG pesado
3. Auditavel: texto plano no banco e facilmente indexavel e buscavel
4. Suficiente: comunicados corporativos raramente precisam de layouts complexos

Para V2 com editor visual: avaliar Tiptap com extensao Markdown, outputando HTML sanitizado.

### Por que denormalizar `autor_nome` na tabela?

O nome do autor pode mudar (ex: casamento, erro de digitacao corrigido) mas o comunicado deve preservar o nome no momento da publicacao. A denormalizacao tambem evita JOINs desnecessarios para a query mais frequente (listagem).

### Categorias fixas vs. dinamicas

As categorias `RH | Produtos | PJ2` sao fixas no schema por enquanto (CHECK constraint). Isso simplifica queries e evita tabela extra. Se o negocio precisar de categorias customizaveis no futuro, migrar para tabela `comunicado_categorias` com FK.

---

## 13. Dependencias de Implementacao

```
content-architect (este doc)
         ↓
design-intranet   → tokens de cor das categorias, card layout, form design
         ↓
backend-intranet  → SQL migration, Hono routes, Zod schemas, middleware requireRole
         ↓
frontend-intranet → paginas Next.js, integracao com API, estados visuais
```

### Ordem sugerida de execucao

1. `backend-intranet`: criar migration SQL + endpoint GET /comunicados (read-only primeiro)
2. `design-intranet`: definir visual dos cards e formulario
3. `frontend-intranet`: substituir dados mockados da `ComunicadosPage` por dados reais da API
4. `backend-intranet`: adicionar POST / PATCH / DELETE com middleware de role
5. `frontend-intranet`: implementar `/comunicados/novo` e `/comunicados/[id]/editar`

---

*Documento gerado pelo agente content-architect em 2026-04-23.*
