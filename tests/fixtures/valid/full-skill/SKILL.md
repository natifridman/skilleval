---
name: full-skill
description: A fully featured skill with all optional fields. Use when you need a complete example of the Agent Skills spec.
license: MIT
compatibility: Requires Node.js 20+
allowed-tools: Bash(npm *) Read
metadata:
  author: test-author
  version: "1.0.0"
---

# Full Skill

This skill demonstrates all features of the Agent Skills specification.

## Usage

Use this skill when you need to perform a complex multi-step operation.

## Steps

1. Read the input
2. Process the data
3. Write the output

## Gotchas

- Make sure to handle empty inputs
- The `output` directory must exist before writing

## Examples

```bash
npm run process -- --input data.json
```
