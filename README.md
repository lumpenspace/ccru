# CCRU

This repository currently centers on an interactive **Numogram** implementation inspired by CCRU concepts, including zones, syzygies, currents, gates, and related structures.

Over time, this repo will also include other CCRU-related experiments, tools, notes, and code projects beyond the Numogram.

## Live URLs

- Home: [num.qliphoth.systems](https://num.qliphoth.systems)
- Numogram: [num.qliphoth.systems/numogram](https://num.qliphoth.systems/numogram)
- Components: [num.qliphoth.systems/components](https://num.qliphoth.systems/components)
- Gematria: [num.qliphoth.systems/gematria](https://num.qliphoth.systems/gematria)
- Gematria Plugin: [num.qliphoth.systems/gematria/plugin](https://num.qliphoth.systems/gematria/plugin)
- Plugin ZIP: [num.qliphoth.systems/downloads/ccru-gematria-plugin.zip](https://num.qliphoth.systems/downloads/ccru-gematria-plugin.zip)

## Component Library (Install From Repo)

Install directly from GitHub:

```bash
npm install github:lumpenspace/ccru
```

Then import from `ccru/components`:

```tsx
import { CyberButton, CyberPanel, CypherHoverText, CCRU_CIPHERS } from 'ccru/components'
```

Notes:

- Components are React/Tailwind-oriented UI primitives.
- This package export is built during install via the `prepare` script.

## Gematria Plugin

The repo ships a Chrome extension (`gematria/plugin`) for in-page gematria overlays and saved phrase workflow.

- Source: [github.com/lumpenspace/ccru/tree/main/gematria/plugin](https://github.com/lumpenspace/ccru/tree/main/gematria/plugin)
- Docs page: [num.qliphoth.systems/gematria/plugin](https://num.qliphoth.systems/gematria/plugin)
- Download ZIP: [num.qliphoth.systems/downloads/ccru-gematria-plugin.zip](https://num.qliphoth.systems/downloads/ccru-gematria-plugin.zip)

Quick install:

1. Download and extract the ZIP.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked and select the extracted extension folder.

### Demo Video

https://github.com/user-attachments/assets/a36bf7f0-91d0-4479-801b-f9fba381a5b1

## Features

- Interactive Numogram with zones, syzygies, currents, and gates
- Multiple visual layouts (`original`, `labyrinth`, `ladder`)
- Layer toggles for focused exploration
- Hover/selection details for zones, flows, gates, and demons
- Built with Next.js + React + TypeScript

## Running Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Repository Scope

This is a growing CCRU workspace. In addition to the Numogram, this repository will accumulate other CCRU-adjacent artifacts, such as:

- Experimental interfaces and visualizations
- Notes and references
- Utility code and small tools

## Structure

- `app/page.tsx` - primary Numogram interface
- `app/components/` - UI and panel components
- `component-library/index.ts` - exported installable components entrypoint (`ccru/components`)
- `app/data/` - syzygies, currents, gates, and demon datasets
- `app/lib/` - math, geometry, and helper logic
- `gematria/plugin/` - Chrome extension source (unpacked build target)
- `demo.mov` - local demo video asset

## Roadmap

- Add more CCRU modules alongside the Numogram
- Improve documentation for concepts and terminology
- Expand visual modes and interaction tooling
