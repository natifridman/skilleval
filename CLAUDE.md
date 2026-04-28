# skilleval

See AGENTS.md for full project context, architecture, and how to add rules.

## Quick reference

```
npm run build          # Compile
npm test               # Run tests
npx tsc --noEmit       # Type check
node bin/skilleval.js check tests/fixtures/valid/full-skill   # Smoke test
```

## Guidelines

- Run `npm test` and `npx tsc --noEmit` before reporting work as complete
- This project is itself a linter — don't add code-style enforcement beyond what the rules check
- ESM with `.js` import extensions throughout
- Prefer editing existing files over creating new ones
- No comments unless the WHY is non-obvious
- When adding a rule: create the rule file, register it in `src/rules/index.ts`, add to all three presets, write tests with the `runRule()` helper
