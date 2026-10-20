# Component rendering regression evidence

Before/after captures for the Plotline/Plotband, Graph, and Treemap fixes.

- Before: upstream main at `209fbb2f197c595bbac3d8e406aae00db9abe9a2`.
- Each after capture uses only that component's fix on the same base.
- WebKit, 1000 × 750 viewport, matching light/dark fixtures and data.
- Plot screenshots show the same 600 ms enter transition at 300 ms. GIFs show entry at 60 ms intervals.
- Graph captures use the same Font Awesome glyphs, node sizes, layout, and font.
- Treemap paint-order captures follow All → Bronx → Brooklyn → Bronx with repeated species names.
- PNG optimization preserves dimensions, alpha, and every decoded pixel.

Images live on this separate branch to keep the fix PRs limited to code and regression tests.
