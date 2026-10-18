# VERDICT.AI

> **Independent Head-to-Head AI Model Benchmark & Automated Judge Evaluation**

**Verdict.ai** is a client-side AI benchmarking workspace that pits two language models against each other in parallel on any prompt, then dispatches both independent responses to a third **Judge Model** to declare a definitive winner and explain why.

---

## ⚡ How It Works

```
                   ┌──────────────────────────────┐
                   │         USER PROMPT          │
                   └──────────────┬───────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 ▼ (Parallel)                      ▼ (Parallel)
    ┌─────────────────────────┐       ┌─────────────────────────┐
    │  MODEL 01 (Contender A) │       │  MODEL 02 (Contender B) │
    │   Independent Answer    │       │   Independent Answer    │
    └────────────┬────────────┘       └────────────┬────────────┘
                 └────────────────┬────────────────┘
                                  ▼
                   ┌──────────────────────────────┐
                   │     MODEL 03 (The Judge)     │
                   │  Evaluates Both Contenders   │
                   │  🏆 Declares Winner + Reason │
                   └──────────────────────────────┘
```

1. **Parallel Independent Contenders (`MODEL 01` & `MODEL 02`):**
   - When you submit a prompt, **Model 1** and **Model 2** are invoked simultaneously via `Promise.all`.
   - Neither model sees the other's output—ensuring an unbiased, head-to-head comparison.
2. **Automated Supreme Judge (`MODEL 03`):**
   - As soon as both contenders finish, **Model 3 (The Judge)** receives the original prompt alongside Model 1's and Model 2's full answers.
   - The Judge evaluates accuracy, depth, code quality, edge-case coverage, and clarity, returning a structured verdict (`winner` + `reason`).
3. **Side-by-Side Inspection & Verdict Banner:**
   - The Judge's **Winner Banner** (`🏆 WINNER: MODEL 1` or `🏆 WINNER: MODEL 2`) and concise reasoning appear at the top of the arena, while both contenders' full Markdown/code outputs are displayed side-by-side below with the winning card highlighted.

---

## 🔌 100% Live Provider APIs (Zero Hardcoded Models)

Verdict.ai never uses mock responses or static model arrays. Pasting an API key triggers a **live HTTP `GET` request** directly from your browser to fetch the exact models enabled on your account:

| Provider | Live Model Discovery (`GET`) | Live Generation (`POST`) |
| :--- | :--- | :--- |
| **OpenAI** | `https://api.openai.com/v1/models` | `https://api.openai.com/v1/chat/completions` |
| **Anthropic (Claude)** | `https://api.anthropic.com/v1/models` | `https://api.anthropic.com/v1/messages` |
| **Google Gemini** | `https://generativelanguage.googleapis.com/v1beta/models` | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` |

> **Privacy Note:** All API keys and requests stay strictly in your browser session and communicate directly with OpenAI, Anthropic, and Google endpoints.

---

## 🗂️ Numeronym Directory Architecture

Every directory inside `src/` follows the strict **numeronym** convention (`[firstLetter][middleLetterCount][lastLetter]`, like `i18n` or `k8s`):

```text
src/
├── c8s/                        # components (c + 8 + s)
│   ├── TopHeader.tsx           # Minimal header & Light/Dark theme switch
│   ├── SetupGrid.tsx           # 3-column configuration strip (MODEL 01, 02, 03)
│   ├── PromptBar.tsx           # IDE-inspired prompt composer
│   ├── DebateArena.tsx         # Full-width Verdict banner + side-by-side contender cards
│   └── MarkdownView.tsx        # Markdown & syntax-highlighted code block renderer
├── s6s/                        # services (s + 6 + s)
│   └── apiService.ts           # Live OpenAI, Anthropic & Gemini model fetch + completions
├── h3s/                        # hooks (h + 3 + s)
│   └── useVerdictPipeline.ts   # Parallel Promise.all contender execution & Judge orchestration
├── t3s/                        # types (t + 3 + s)
│   └── types.ts                # Core TypeScript interfaces
├── u3s/                        # utils (u + 3 + s)
│   └── verdictUtils.ts         # Structured Judge JSON parser & timing formatters
├── App.tsx                     # Root application layout
├── main.tsx                    # React DOM entry point
└── index.css                   # Warm Stone & GitHub Dark theme styles
```

---

## 🎨 Design Language

Inspired by **GitHub Primer × VS Code × Warm Monochrome**:
- **Light Mode:** Warm stone canvas (`#F6F5F2`), crisp white surfaces (`#FFFFFF`), `1px solid #D0D7DE` structural borders, and deep obsidian typography (`#1F2328`).
- **Dark Mode:** Deep GitHub/VS Code canvas (`#0D1117`), elevated slate surfaces (`#161B22`), `#30363D` hairline borders, and high-contrast `#F0F6FC` typography.
- **Monospace Telemetry:** Uses `JetBrains Mono` / `Fira Code` for model identifiers, role badges (`MODEL 01`, `MODEL 02`, `JUDGE 03`), and execution latency timers.

---

## 🚀 Getting Started

### Option 1: Instant Launch (Zero Install)
Open `index.html` directly in any modern browser. It loads the pre-compiled bundle from `dist/verdict-bundle.js`.

### Option 2: Local Development with Vite
```bash
npm install
npm run dev
```

To create a production build:
```bash
npm run build
```

---

## 📄 License

Distributed under the [MIT License](./LICENSE).
