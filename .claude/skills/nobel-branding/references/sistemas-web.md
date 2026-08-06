# Branding Nobel — Sistemas Web (Next.js, Dashboards, HTML)

Sistemas web da Nobel usam **sempre o sistema operacional**, exceto o site institucional público que usa editorial. O intranet, dashboards, ferramentas internas e APIs com UI usam a paleta neutra quente + azul de sistema.

---

## Tokens CSS — Cole diretamente

### Variáveis de cor

```css
:root {
  /* Marca */
  --c-midnight:      #0E1A2B;
  --c-midnight-deep: #08111E;
  --c-gold:          #C9A961;
  --c-ivory:         #F4EFE6;
  --c-ivory-soft:    #E8E2D4;

  /* Neutros operacionais */
  --n-25:  #FAFAF7;
  --n-50:  #F5F4EE;
  --n-100: #EDEBE2;
  --n-200: #E0DDD0;
  --n-300: #C9C5B5;
  --n-400: #A6A290;
  --n-500: #807D6E;
  --n-600: #5C5A4F;
  --n-700: #3F3E37;
  --n-800: #25241F;
  --n-900: #14130F;

  /* Azul de sistema */
  --b-50:  #E8F0FA;
  --b-100: #C8DBF1;
  --b-300: #84AAE0;
  --b-500: #6094D6;
  --b-600: #4978B5;
  --b-700: #2F5588;

  /* Ouro — variantes de suporte */
  --nobel-gold-glow:  #FFD500;   /* acento em dark mode (Onyx) */
  --nobel-gold-light: #E6B800;   /* topo de gradientes */

  /* Paleta de séries de gráfico — direção padrão (light mode) */
  --chart-1: #C29404;   /* Ouro Nobel     — série primária */
  --chart-2: #8F6B12;   /* Ouro Profundo  */
  --chart-3: #343534;   /* Tinta (Ink)    */
  --chart-4: #5F5E5B;   /* Grafite        */
  --chart-5: #8C8B87;   /* Cinza Médio    */
  --chart-6: #B4B3AE;   /* Névoa (Fog-grey) */
  --chart-7: #D2D1CC;   /* Cinza Claro    */

  /* Semânticas — variações de portfólio */
  --success:     #248A47;  /* Verde Nobel  — variação positiva  */
  --destructive: #D94141;  /* Vermelho Nobel — variação negativa */
  --warn:        oklch(0.72 0.13 75);
  --info:        oklch(0.62 0.07 245);

  /* Surfaces operacionais */
  --bg:        var(--n-25);
  --bg-elev:   #ffffff;
  --bg-deep:   var(--n-50);
  --fg:        var(--n-800);
  --fg-mute:   var(--n-500);
  --fg-faint:  var(--n-400);
  --line:      var(--n-200);
  --line-strong: var(--n-300);

  /* Tipografia — fontes customizadas Nobel */
  --f-display: "Relicta", "Georgia", serif;          /* títulos, hero, KPI em destaque */
  --f-text:    "Garet", "Helvetica Neue", sans-serif; /* corpo, UI, labels */
  --f-num:     "Garet", "Helvetica Neue", sans-serif; /* números em gráficos e tabelas */

  /* Raios */
  --r-0:   0;
  --r-1:   2px;
  --r-2:   4px;
  --r-3:   8px;
  --r-pill: 999px;

  /* Elevação */
  --e-float:       0 1px 2px rgba(14,26,43,.06), 0 6px 14px rgba(14,26,43,.07), 0 18px 32px rgba(14,26,43,.06);
  --e-float-hover: 0 2px 4px rgba(14,26,43,.08), 0 10px 22px rgba(14,26,43,.10), 0 28px 48px rgba(14,26,43,.10);
  --e-1: 0 1px 2px rgba(14,26,43,.04), 0 1px 3px rgba(14,26,43,.05), 0 0 0 1px var(--line);
  --e-2: 0 2px 4px rgba(14,26,43,.05), 0 8px 18px rgba(14,26,43,.08), 0 0 0 1px var(--line);
}
```

### Carregamento das fontes (@font-face)

As fontes Relicta e Garet são arquivos locais — sirva via `/public/fonts/`. Os arquivos disponíveis são:

- `Garet-Book.ttf` / `.woff2` → peso 400 (corpo, labels, UI, números)
- `Garet-Heavy.ttf` / `.woff2` → peso 700 (destaque, negrito)
- `Relicta-Light.otf` → peso 300 (títulos, headings)
- `Relicta-UltraboldItalic.otf` → peso 800 italic (decorativo, word-chave em itálico)

```css
/* Relicta — títulos e headings */
@font-face {
  font-family: "Relicta";
  src: url("/fonts/relicta/Relicta-Light.otf") format("opentype");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Relicta";
  src: url("/fonts/relicta/Relicta-UltraboldItalic.otf") format("opentype");
  font-weight: 800;
  font-style: italic;
  font-display: swap;
}

/* Garet — corpo de texto e números em tabelas/gráficos */
@font-face {
  font-family: "Garet";
  src: url("/fonts/garet/Garet-Book.woff2") format("woff2"),
       url("/fonts/garet/Garet-Book.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Garet";
  src: url("/fonts/garet/Garet-Heavy.woff2") format("woff2"),
       url("/fonts/garet/Garet-Heavy.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

> **Pesos disponíveis:** Relicta tem apenas Light (300) e UltraboldItalic (800i) — use `font-weight: 300` para todos os títulos. Garet tem Book (400) e Heavy (700) — use 400 para corpo/números e 700 para negrito/destaque.

### Dark mode (tema editorial — páginas institucionais)

```css
[data-theme="dark"] {
  --bg:      var(--c-midnight);
  --bg-elev: var(--c-midnight-deep);
  --bg-deep: #101c2e;
  --fg:      var(--c-ivory);
  --fg-mute: var(--n-400);
  --fg-faint: var(--n-500);
  --line:    rgba(201, 169, 97, 0.12);  /* gold muito sutil */
  --line-strong: rgba(201, 169, 97, 0.22);
}
```

---

## Tailwind v4 — Configuração (`globals.css`)

```css
@import "tailwindcss";

@theme {
  /* Sem var() aqui — apenas valores estáticos */
  --color-bg:             #FAFAF7;
  --color-bg-elev:        #ffffff;
  --color-fg:             #25241F;
  --color-fg-mute:        #807D6E;
  --color-line:           #E0DDD0;
  --color-brand-gold:     #C9A961;
  --color-brand-midnight: #0E1A2B;
  --color-b-50:           #E8F0FA;
  --color-b-500:          #2D5FA0;  /* light mode — NÃO usar #6094D6 aqui */
  --color-b-600:          #4978B5;
  --color-b-700:          #2F5588;
  --color-n-25:           #FAFAF7;
  --color-n-50:           #F5F4EE;
  --color-n-100:          #EDEBE2;
  --color-n-200:          #E0DDD0;
  --color-n-800:          #25241F;
  --color-n-900:          #14130F;

  --font-display: "Relicta", Georgia, serif;
  --font-sans:    "Garet", "Helvetica Neue", sans-serif;
  --font-num:     "Garet", "Helvetica Neue", sans-serif;

  --radius-card:  8px;
  --shadow-float: 0 1px 2px rgba(14,26,43,.06), 0 6px 14px rgba(14,26,43,.07), 0 18px 32px rgba(14,26,43,.06);
}
```

**Atenção:** `@theme` no Tailwind v4 não aceita `var()` — use valores hex/px estáticos.

---

## Componentes padrão

### Card flutuante

```css
.card {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--r-3);   /* 8px máximo */
  box-shadow: var(--e-float);
  transition: transform .25s ease, box-shadow .25s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--e-float-hover);
}
```

### KPI Card (HTML/JSX)

```html
<div class="kpi-card">
  <div class="kpi-header">
    <span class="kpi-label">AUM TOTAL</span>
    <span class="kpi-badge pos">+ 2,41%</span>
  </div>
  <div class="kpi-value">
    R$ 2,84<span class="kpi-unit">BI</span>
  </div>
  <!-- sparkline opcional, 34px altura -->
</div>

<style>
.kpi-card   { background: var(--bg-elev); border: 1px solid var(--line); border-radius: 8px; box-shadow: var(--e-float); padding: 16px 20px; }
.kpi-label  { font-family: var(--f-text); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--fg-mute); }
/* Valor hero — usa Relicta para destaque máximo */
.kpi-value  { font-family: var(--f-display); font-size: 30px; font-weight: 700; color: var(--fg); }
.kpi-unit   { font-size: 14px; color: var(--fg-mute); margin-left: 2px; font-family: var(--f-text); }
.kpi-badge  { font-family: var(--f-text); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; }
.kpi-badge.pos { background: var(--pos-bg, oklch(0.93 0.04 155)); color: var(--pos-fg, oklch(0.35 0.09 155)); }
.kpi-badge.neg { background: var(--neg-bg, oklch(0.93 0.05 25));  color: var(--neg-fg, oklch(0.35 0.12 25));  }
</style>
```

### Sidebar — Active state

```css
.nav-item         { background: transparent; color: var(--fg); border-radius: 6px; }
.nav-item:hover   { background: var(--bg-deep); }
.nav-item.active  { background: var(--fg); color: var(--bg); }  /* invertido */

/* Avatar do usuário */
.user-avatar {
  border-radius: 50%;
  background: var(--b-500);
  color: #fff;
  font-family: var(--f-text);
  font-weight: 600;
}
```

### Tabela densa

```css
/* Cabeçalho em Garet — labels de colunas */
.table-header { font-family: var(--f-text); font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: var(--fg-mute); }
.table-row    { border-bottom: 1px solid var(--line); }
.table-row:hover { background: var(--n-50); }
/* Números em Garet com tnum para alinhamento */
.table-num    { font-family: var(--f-num); font-feature-settings: "tnum"; text-align: right; }
```

### Botão primário

```css
.btn-primary {
  background: var(--b-500);
  color: #fff;
  border-radius: var(--r-1);     /* 2px */
  padding: 6px 16px;
  font-family: var(--f-text);
  font-size: 13px;
  font-weight: 500;
}
.btn-primary:focus-visible {
  outline: 3px solid rgba(96, 148, 214, .3);
  outline-offset: 2px;
}
```

---

## Next.js — Fontes (app/layout.tsx)

Como Relicta e Garet são fontes locais (não disponíveis no Google Fonts), use `next/font/local`:

```ts
import localFont from "next/font/local";

const relicta = localFont({
  src: [
    { path: "../public/fonts/relicta/Relicta-Light.otf",           weight: "300", style: "normal" },
    { path: "../public/fonts/relicta/Relicta-UltraboldItalic.otf", weight: "800", style: "italic" },
  ],
  variable: "--f-display",
  display: "swap",
});

const garet = localFont({
  src: [
    { path: "../public/fonts/garet/Garet-Book.ttf",  weight: "400", style: "normal" },
    { path: "../public/fonts/garet/Garet-Heavy.ttf", weight: "700", style: "normal" },
  ],
  variable: "--f-text",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${relicta.variable} ${garet.variable}`}>
      <body style={{ fontFamily: "var(--f-text)" }}>{children}</body>
    </html>
  );
}
```

> **Pesos disponíveis:** Relicta-Light (300) para títulos e Relicta-UltraboldItalic (800i) para decorativo. Garet-Book (400) para corpo/números e Garet-Heavy (700) para negrito.

---

## Densidades de UI

```css
[data-density="compact"]  { --row-h: 30px; --pad-x: 12px; --pad-y: 6px; }
[data-density="balanced"] { --row-h: 36px; --pad-x: 14px; --pad-y: 8px; }
[data-density="cozy"]     { --row-h: 44px; --pad-x: 16px; --pad-y: 12px; }
```

Padrão do intranet Nobel: `balanced`.

---

## Padrões geométricos (uso em sistemas)

Em dashboards, use apenas P-01 (grid) ou P-02 (dot grid) para empty states — opacidade entre 4% e 18%:

```css
.empty-state-bg {
  background-image: radial-gradient(circle, var(--n-300) 1px, transparent 1px);
  background-size: 16px 16px;
  opacity: 0.08;
}
```

---

## Direções alternativas de paleta para gráficos

Use quando o contexto exigir dark mode