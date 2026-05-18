# OpenCode Free Models Fetcher

Fetch and filter OpenRouter free models for OpenCode.

## Purpose

This script fetches the list of free models from OpenRouter API and filters them based on quality criteria, then updates the OpenCode configuration file with the filtered models.

## Features

- Filters models with **prompt** and **completion** pricing set to "0" (free)
- Filters models with **parameter size >= 40B** (for high-quality models)
- Filters models that support **tools** parameter (for tool calling)
- Filters models with **context length >= 128K** (for long context)
- Filters models with **max completion tokens >= 32K** (for longer outputs)
- Filters models that are **active** (not expired)

## Usage

Run the script directly:

```bash
node update-opencode-free-models.mjs
```

The script will:
1. Fetch all models from OpenRouter API
2. Apply filters
3. Update `/Users/linnahan/.config/opencode/opencode.json` with the filtered models

## Requirements

- Node.js (v18+)
- OpenCode installed

## Notes

This script is designed to keep your OpenCode configuration up-to-date with the best free models available on OpenRouter.

