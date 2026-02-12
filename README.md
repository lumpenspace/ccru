# CCRU

This repository currently centers on an interactive **Numogram** implementation inspired by CCRU concepts, including zones, syzygies, currents, gates, and related structures.

Over time, this repo will also include other CCRU-related experiments, tools, notes, and code projects beyond the Numogram.

## Numogram

Explore the live Numogram here: [num.qliphoth.systems](https://num.qliphoth.systems)

### Demo Video

[![Watch the video](https://i.sstatic.net/Vp2cE.png)](https://github.com/lumpenspace/ccru/blob/main/demo.mov)

<video src="./demo.mov" controls muted playsinline width="900">
  Your browser does not support embedded video playback.
</video>

If the embed does not render on your platform, open the video directly: [`demo.mov`](./demo.mov).

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
- `app/data/` - syzygies, currents, gates, and demon datasets
- `app/lib/` - math, geometry, and helper logic
- `demo.mov` - local demo video asset

## Roadmap

- Add more CCRU modules alongside the Numogram
- Improve documentation for concepts and terminology
- Expand visual modes and interaction tooling
