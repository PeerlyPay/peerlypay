# AGENTS.md

Guidance for coding agents working in the project
This repo has two primary parts:
- Next.js 16 + TypeScript frontend at repository root.
- Soroban Rust smart contract workspace in `contracts/`.

## 1) Build, Lint, and Test Commands

Run commands from the correct directory.

### Frontend (repo root)
- Install deps: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Start production server: `npm run start`
- Lint: `npm run lint`

Notes:
- `package.json` currently defines no frontend unit/integration test script.
- If you add tests, also add documented commands here.

### Smart contracts (`contracts/` workspace)
- Build all contracts: `cargo build`
- Run all contract tests: `cargo test`
- Run tests with logs: `cargo test -- --nocapture`
- Run release build: `cargo build --release`

### Single-test execution (important)
- Run one exact Rust test by name:
  - `cargo test test_release_funds_successful_flow -- --exact --nocapture`
- Run tests matching a substring:
  - `cargo test dispute_resolution -- --nocapture`
- Run tests for one crate from workspace root:
  - `cargo test -p escrow test_dispute_management -- --exact --nocapture`
- If already inside `contracts/contracts/escrow`, same command works without `-p`.

### Soroban CLI commands (from `contracts/README.md`)
- Build contract wasm: `stellar contract build`
- Install wasm to network:
  - `stellar contract install --network <network> --source <source_account> --wasm <path_to_wasm>`
- Deploy by wasm hash:
  - `stellar contract deploy --wasm-hash <wasm_hash> --source <source_account> --network <network>`

Use these only when deployment/network work is requested.

## 2) Code Style and Engineering Guidelines

Follow existing patterns in this repository. Prefer minimal, consistent changes.

### General
- Keep changes scoped and task-focused; avoid unrelated refactors.
- Do not introduce new dependencies unless needed.
- Prefer explicit, readable code over clever shortcuts.
- Preserve current architecture (App Router + Zustand + Soroban module layout).

### Simplicity and clarity (important)
- Prefer the smallest working solution over layered abstractions.
- Avoid adding wrappers/factories unless they remove real repetition or risk.
- Keep on-chain read/write paths straightforward: one module per concern, predictable exports.
- Co-locate tiny helpers near their usage; extract only when reused across modules.
- Keep data flow easy to trace (input -> contract call -> mapping -> UI).
- Use concise section comments for long utility files; avoid narrative comments.
- If code is difficult to explain in 2-3 bullets, simplify before extending.

### TypeScript / Next.js
- Language level: strict TypeScript style with explicit domain types.
- Prefer `type`/`interface` in `types/index.ts` and shared modules.
- Avoid `any`; use unions, discriminated unions, and concrete interfaces.
- Use `@/` path alias imports for internal modules.
- Keep React components functional and hook-based.

### Imports
- Group imports in this order:
  1. React/Next imports
  2. Third-party libraries
  3. Internal `@/` imports
  4. Type-only imports (or inline via `import type`)
- Keep imports stable and avoid deep relative traversals when `@/` exists.

### Formatting and file hygiene
- Match the existing formatting style in touched files; avoid one-off formatting changes.
- Keep function bodies short and extract helpers when a block becomes hard to scan.
- Prefer early returns for validation and guard clauses.
- Avoid dead code, commented-out blocks, and leftover debug logs.
- Keep component props and return types explicit when non-trivial.
- Do not mix unrelated concerns in one file (UI, data fetching, and domain logic).

### Naming conventions
- Components: `PascalCase` (`CreateOrderForm`, `OrderDetailClient`).
- Variables/functions: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants (`SKELETON_COUNT`).
- Types/interfaces/enums: `PascalCase`.
- Route files follow Next.js conventions (`page.tsx`, `layout.tsx`).

### React and state
- Keep page components thin; extract reusable UI to `components/`.
- Use Zustand store selectors (`useStore((s) => s.orders)`) to limit rerenders.
- Memoize derived collections when non-trivial (`useMemo`).
- Prefer deterministic UI state transitions over ad hoc side effects.

### Styling
- Use existing Tailwind utility patterns and design tokens from `globals.css`.
- Reuse shadcn/ui primitives in `components/ui/` before creating new primitives.
- Maintain mobile-first layout conventions used across pages.

### Error handling (frontend)
- Validate user input before mutating state or sending transactions.
- Fail fast with clear user feedback (toasts, inline hints).
- Do not swallow errors silently; at minimum log actionable context.
- Keep user-facing messages concise and non-technical.

### On-chain frontend integration
- Prefer generated Soroban bindings as the source of truth for contract methods/types.
- Keep contract id configurable via env, but allow safe fallback to generated network defaults when appropriate.
- Normalize contract `Result`/optional values in one place and reuse that path.
- For contract reads, log count + per-item failures with order id to make debugging quick.
- Keep mapping boundaries explicit: `Chain*` types for contract data, `Ui*` types for display.

### Rust / Soroban contract style
- Keep business logic in manager modules (`core/*`) and checks in validators.
- Add/extend `ContractError` variants instead of using generic failures.
- Use `Result<_, ContractError>` consistently for fallible logic.
- Enforce auth with `require_auth()` at function boundaries.
- Emit events for state-changing operations.
- Use safe math helpers already provided in `modules/math` and `modules/fee`.

### Rust naming and structure
- Types/structs/enums: `PascalCase`.
- Functions/modules/files: `snake_case`.
- Keep validator function names explicit (`validate_*_conditions`).
- Keep contract entrypoints thin; delegate logic to managers.

### Testing expectations
- Prefer adding/adjusting tests with any logic change in `contracts`.
- Reuse existing test setup patterns from `contracts/contracts/escrow/src/tests/test.rs`.
- For bug fixes, add a regression test named after the behavior.
- Run targeted test(s) first, then broader suites when practical.

### Documentation and comments
- Add comments only for non-obvious rules/invariants.
- Keep README/contract docs aligned with implemented behavior.
- If adding commands or workflows, update this file and relevant README.

## 3) Repository-Specific Observations

- Frontend is in transition from mocked order flows to contract-backed reads.
- Contract module has real validation and fee/dispute logic with tests.
- Large UI files (for example order detail) should be refactored only when requested.

## 4) Cursor/Copilot Rules

Checked for repository-level agent instruction files:
- `.cursor/rules/`: not present.
- `.cursorrules`: not present.
- `.github/copilot-instructions.md`: not present.

If these files are added later, treat them as authoritative and merge their guidance here.

## 5) Safe Change Checklist for Agents

- Confirm target directory before running commands.
- Run lint/build/tests relevant to touched code.
- Do not commit secrets or environment-specific credentials.
- Avoid destructive git operations unless explicitly requested.
- Summarize what changed, why, and how it was verified.
