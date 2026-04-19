## Prompt

Build a modern enterprise security dashboard SPA with the following design DNA:

### Typography & Color

- Font: **Inter** (Google Fonts), weights 300–700, `-webkit-font-smoothing: antialiased`
- Page background: `#f0f2f5`
- Card/surface background: `#ffffff`
- Primary accent: `#CC0033` (Swiss red)
- Body text: `#3a3a3a`, muted text: `#8a8a8a`, headings/charcoal: `#1e1e2e`
- Success green: `#6abf07`, warning amber: `#f59e0b`
- No dark mode

### CSS Custom Properties

```css
:root {
  --red: #CC0033;
  --red-dark: #a80029;
  --red-glow: rgba(204, 0, 51, .18);
  --text: #3a3a3a;
  --muted: #8a8a8a;
  --charcoal: #1e1e2e;
  --bg: #f0f2f5;
  --surface: #fff;
  --border: #e8e8ec;
  --lime: #6abf07;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
  --shadow: 0 4px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.05);
  --shadow-lg: 0 12px 32px rgba(0,0,0,.10), 0 2px 8px rgba(0,0,0,.06);
  --radius: 14px;
  --radius-sm: 8px;
  --radius-pill: 9999px;
}
```

### Header — Two-Tier, Sticky

**Top bar:**
- White background, 60px tall, 1px bottom border (`#e8e8ec`)
- Left: text-only logo in `#CC0033`, 17px, weight 700
- Right: status badge (green dot + label) + metadata in small muted text

**Navbar below (the key element — floating red pill):**
- The nav element itself is the pill: `background: #CC0033`, `border-radius: 14px`, `padding: 4px 6px`
- `box-shadow: 0 6px 20px rgba(204,0,51,.18), 0 2px 6px rgba(0,0,0,.1)`
- Spans the full content width but is visually a self-contained floating pill — not a full-width bar
- Wrapped in a `div.nav-wrap` with `background: #f0f2f5` and `padding: 10px 36px 12px`
- Nav buttons: `background: none`, white text at 70% opacity, `border-radius: 9px`, height 36px
- Hover: `background: rgba(255,255,255,.12)`, full white text
- Active: `background: rgba(255,255,255,.18)`, full white, weight 600
- Badge counters on buttons: white pill with red text, 9.5px
- Right side: search input with `background: rgba(255,255,255,.15)`, `border: 1.5px solid rgba(255,255,255,.25)`, white placeholder text, pill-shaped, expands on focus

### Layout

- **No sidebar** — all navigation is horizontal in the top pill bar
- Content: `padding: 28px 36px 48px`, `max-width: 1540px`, centered
- Views toggled via JS — only one `.view.active` visible at a time

### Cards & Depth

- Depth via **box-shadow only** — never borders on cards
- Standard card shadow: `0 4px 12px rgba(0,0,0,.07), 0 1px 3px rgba(0,0,0,.05)`
- Card `border-radius: 14px`, background white
- Stat cards have a **3px colored top accent bar** (red, green gradient, amber gradient, or grey)
- Hover state: `transform: translateY(-1px)` + slightly stronger shadow
- Charts live inside cards with a 180px fixed-height wrapper

### Buttons

- Pill-shaped: `border-radius: 9999px`, `border: 1.5px solid`
- Font: Inter, 12.5px, weight 600
- **Primary:** `background: #CC0033`, white text, red glow shadow
- **Outline:** white bg, `#e8e8ec` border → hover turns red border + text
- **Small variant:** 12px font, `padding: 5px 14px`
- Hover: `translateY(-1px)` on primary

### Tables

- Header row: `background: #f8f8fa`, 11px uppercase, muted, letter-spacing 0.5px
- Row separator: `#f2f2f4` (very subtle)
- Row hover: `#fafafa`
- Wrapped in a card container with rounded corners and shadow
- Toolbar above table: filter pills + search input, `padding: 16px 20px`, bottom border
- Filter pills: pill-shaped toggle buttons, active state: red border + red text + `#fff5f7` background
- Paginator: small numbered buttons below table, active page in red

### Severity Badges

All use `border-radius: 9999px`, 11px font, bold:

| Severity | Background | Text color |
|----------|-----------|------------|
| Critical | `#fff0f0` | `#c0152d` |
| High | `#fff4ec` | `#c44b0a` |
| Medium | `#fefbeb` | `#926500` |
| Low | `#f0fdf4` | `#15692a` |
| Info | `#f0f8ff` | `#065985` |

### Platform Badges

| Platform | Background | Text color |
|----------|-----------|------------|
| Windows | `#eff6ff` | `#1d4ed8` |
| macOS | `#faf0ff` | `#7e22ce` |
| Linux | `#fefce8` | `#854d0e` |
| iOS | `#f0fdf4` | `#15692a` |
| Android | `#fff4ec` | `#c44b0a` |
| Server | `#f4f6f9` | `#475569` |

### Status Indicators

Dot + label using `::before` pseudo-element (7px circle):

- **OK / Compliant:** green dot `#22c55e`, text `#15692a`
- **Warning:** amber dot `#f59e0b`, text `#926500`
- **Error / Active:** red dot `#CC0033`, text `#c0152d`

### Toast Notifications

- Position: bottom-right, `z-index: 500`
- Default: `background: #1e1e2e` (dark charcoal)
- Success: `#166534` | Warning: `#92400e` | Error: `#b91c1c`
- `border-radius: 10px`, slide-up animation on appear, fade-down on dismiss
- Auto-dismiss after ~3.5s

### Slide-in Detail Panel

- Slides in from right: `position: fixed`, 480px wide, full viewport height
- Transition: `right: -500px` → `right: 0`, cubic-bezier easing
- Header: `background: #CC0033`, white text
- Body: `dt/dd` rows — label left (muted), value right (bold), bottom border between rows
- Backdrop overlay: `rgba(0,0,0,.3)` with `backdrop-filter: blur(2px)`

### Modal (Report Preview)

- Centered overlay: `rgba(0,0,0,.45)` + `backdrop-filter: blur(3px)`
- Modal: white, `border-radius: 14px`, `max-width: 860px`, `max-height: 90vh`, scrollable body
- Header: red (`#CC0033`), white text
- Scale-in animation on open
- Footer: white, right-aligned action buttons

### Coming Soon States

- `.cs-wrap`: `pointer-events: none`, `opacity: 0.55`, `::after` shows "Coming Soon" label
- Nav buttons with a `Soon` badge: small white pill label inside the button
- Dashed border cards: `border: 1.5px dashed #d8d8de`, `border-radius: 14px`, `opacity: 0.7`
- Striped overlay: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,.015) 8px, rgba(0,0,0,.015) 16px)`

### Sub-tabs (within views)

- Container: `background: #f0f2f5`, `padding: 4px`, `border-radius: 8px`, `width: fit-content`
- Inactive: no background, muted text
- Active: white background, red text, weight 700, small shadow

### Settings Sidebar

- 210px left nav + 1fr content, `gap: 24px`
- Nav items: `border-radius: 8px`, hover `#f0f2f5`, active `background: #fff5f7`, `color: #CC0033`, weight 700
- Section headers: 10px uppercase, `#bbb`, letter-spacing 0.6px

### Scrollbar

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d0d0d6; border-radius: 3px; }
```

### Overall Aesthetic

Clean, quiet, white-dominant. Red is used sparingly — **only** for the navbar pill, accent bars on stat cards, critical status indicators, and primary action buttons. No gradients on content (only subtle 3px accent bars). Shadows replace borders everywhere. Inspired by Swiss precision design — confident, minimal, functional. The floating red pill navbar is the single most distinctive element of this design.