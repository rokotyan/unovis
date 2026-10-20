# Svelte 4 and 5 compatibility review captures

Source branch: `rokotyan/unovis:codex/svelte-4-5-compat`  
Source commit: `ea9292a8d2604de9a089420574107175be264d8f`  
Base: `f5/unovis:main` at `209fbb2f197c595bbac3d8e406aae00db9abe9a2`  
Captured: 2026-10-20 UTC  
Viewport: 1280 × 720 CSS pixels  
Compilers/runtimes: Svelte 4.2.20 and Svelte 5.56.10

These are browser captures of the actual packaged `@unovis/svelte` components and the committed compatibility fixtures. A temporary HTML shell adds a three-column layout, theme classes, descriptive headings, an action toolbar, and a last-action label. The shell is only for review captures and is not included in the application PR. The Line/Axis/Donut/BulletLegend behavior comes from the committed fixtures and built library output.

The static images show the same action sequence in both runtimes and themes:

1. Replace component-owned Line data.
2. Mutate a point in component-owned data.
3. Replace XYContainer-owned data.
4. Mutate a point in XYContainer-owned data.
5. Update color, line width, container height, and legend items.
6. Mutate a nested legend item name.
7. Switch Axis type from X to Y.

The GIF is a 15-second step-by-step animation assembled from ten real browser screenshots, each held for 1.5 seconds. It shows the initial state, the seven actions above, then removal and remounting of the child Line. It is not a continuous real-time screen recording. The status strip identifies each action.

## Captures

| Runtime | Light | Dark |
| --- | --- | --- |
| Svelte 4 legacy parent | [Screenshot](svelte4-light.jpg) | [Screenshot](svelte4-dark.jpg) |
| Svelte 5 runes parent | [Screenshot](svelte5-runes-light.jpg) | [Screenshot](svelte5-runes-dark.jpg) |

[Animated Svelte 5 interaction sequence](svelte5-runes-reactivity.gif)

## Observed limitation

Switching a live Axis from X to Y leaves some old grid-line geometry visible. The wrapper now updates its axis registration correctly, and the automated tests assert registration and destruction/remounting; they do not assert pixel correctness of this core Axis orientation transition. The captures preserve this artifact rather than hiding it. The compatibility PR does not change the core Axis renderer.

## Reproduce the automated checks

Check out the source branch, use the Node and pnpm versions pinned in the repository, install dependencies, then run:

```sh
pnpm build:ts
pnpm build:svelte
pnpm --dir packages/svelte test
```

Fixtures: `packages/svelte/test/fixtures/{Chart,Legacy,Runes,RunesChart}.svelte` and `state.ts`. The test bundler selects the actual Svelte 4 or 5 compiler/runtime and consumes `packages/svelte/dist`, without TypeScript preprocessing of the packaged components.

Images are stored on a separate branch so the implementation PR contains no review-media binaries.
