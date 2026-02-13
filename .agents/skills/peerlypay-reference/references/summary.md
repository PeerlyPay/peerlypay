This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# Summary

## Purpose

This is a reference codebase organized into multiple files for AI consumption.
It is designed to be easily searchable using grep and other text-based tools.

## File Structure

This skill contains the following reference files:

| File | Contents |
|------|----------|
| `project-structure.md` | Directory tree with line counts per file |
| `files.md` | All file contents (search with `## File: <path>`) |
| `tech-stack.md` | Languages, frameworks, and dependencies |
| `summary.md` | This file - purpose and format explanation |

## Usage Guidelines

- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes

- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: **/.git/**, **/.github/**, **/.gitignore, **/.gitattributes, **/node_modules/**, **/.pnpm-store/**, **/.yarn/**, **/.yarn-cache/**, **/.yarnrc.yml, **/pnpm-lock.yaml, **/package-lock.json, **/yarn.lock, **/dist/**, **/build/**, **/out/**, **/target/**, **/artifacts/**, **/cache/**, **/coverage/**, **/reports/**, **/tmp/**, **/temp/**, **/logs/**, **/log/**, **/__pycache__/**, **/*.pyc, **/*.pyo, **/*.pyd, **/.venv/**, **/venv/**, **/env/**, **/.poetry/**, **/.pytest_cache/**, **/.mypy_cache/**, **/.ruff_cache/**, **/.tox/**, **/Cargo.lock, **/target/**, **/foundry.toml, **/broadcast/**, **/forge-cache/**, **/lib/**, **/hardhat.config.*, **/scripts/**, **/tasks/**, **/deploy/**, **/deployments/**, **/typechain/**, **/typechain-types/**, **/test/**, **/tests/**, **/__tests__/**, **/spec/**, **/specs/**, **/benchmarks/**, **/fuzz/**, **/proptest-regressions/**, **/examples/**, **/example/**, **/demo/**, **/demos/**, **/sample/**, **/samples/**, **/playground/**, **/sandbox/**, **/docs/assets/**, **/assets/**, **/static/**, **/public/**, **/images/**, **/img/**, **/media/**, **/.vscode/**, **/.idea/**, **/.editorconfig, **/.prettierrc*, **/.eslintrc, **/eslint.config.mjs, **/postcss.config.mjs, **/next.config.ts, **/components.json, **/biome.json, **/rustfmt.toml, **/clippy.toml, **/tsconfig*.json, **/justfile, **/turbo.json, **/nx.json, **/lerna.json, **/*.mdx, **/CHANGELOG.md, **/CODE_OF_CONDUCT.md, **/CONTRIBUTING.md, **/SECURITY.md, **/LICENSE*, **/migrations/**, **/.migrations/**, **/scripts/migrations/**, **/*.log, **/*.tmp, **/*.swp, **/.agents/, **/.agent/
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

## Statistics

83 files | 10,479 lines

| Language | Files | Lines |
|----------|------:|------:|
| TypeScript (TSX) | 60 | 7,935 |
| Rust | 11 | 947 |
| TypeScript | 3 | 242 |
| Markdown | 3 | 687 |
| TOML | 2 | 40 |
| No Extension | 1 | 167 |
| CSS | 1 | 418 |
| EXAMPLE | 1 | 1 |
| JSON | 1 | 42 |

**Largest files:**
- `src/app/orders/page.tsx` (743 lines)
- `src/app/orders/[id]/OrderDetailClient.tsx` (509 lines)
- `src/app/trade/payment/page.tsx` (422 lines)
- `src/app/globals.css` (418 lines)
- `src/components/QuickTradeInput.tsx` (415 lines)
- `src/app/trade/success/page.tsx` (407 lines)
- `contracts/README.md` (383 lines)
- `src/app/trade/waiting/page.tsx` (350 lines)
- `src/components/CompactEscrowStepper.tsx` (329 lines)
- `src/app/marketplace/MarketplaceContent.tsx` (315 lines)