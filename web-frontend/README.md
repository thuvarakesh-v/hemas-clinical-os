# Hemas Clinical OS Frontend (Source of Truth)

This project is the reference frontend for the Hemas Clinical OS interface.

It is a React + Vite application organized with Atomic Design principles while preserving pixel-perfect UI behavior.

## Tech Stack

- React 19
- Vite 8
- React Router
- Tailwind CSS v4
- Framer Motion
- Lucide React
- ESLint (flat config)

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```

## Project Structure

```text
src/
	App.jsx
	main.jsx
	index.css
	components/
		atoms/
		molecules/
		organisms/
		templates/
		pages/
	data/
	routes/
```

### Atomic Layers

- atoms: Small reusable primitives (for example icons, base buttons)
- molecules: Small composed UI controls (for example search field, tab group)
- organisms: Larger feature sections and domain blocks
- templates: Layout composition and shared app shell structure
- pages: Route-level pages that compose templates and organisms

## Routing

Routing is configured in `src/routes/AppRoutes.jsx` and mounted from `src/App.jsx`.

## Styling Notes

- Tailwind utility classes are intentionally preserved to maintain exact UI fidelity.
- Arbitrary values and CSS variable-based classes are used by design.

Workspace settings in `.vscode/settings.json` suppress non-critical canonical-class suggestions so editors do not flag these intentional class patterns as warnings.

## Quality Checks

- Lint:

```bash
npm run lint
```

- Build validation:

```bash
npm run build
```

## Purpose of this Folder

This folder is the maintained source-of-truth frontend baseline used for synchronization and comparison with other application variants in the workspace.
