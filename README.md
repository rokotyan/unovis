# Dev gallery PR screenshots

All browser viewports are 1440 × 1000 pixels.

Before: `9152934547fbce1167ba9e332985795de3cb4fd3` (the branch fork point).
After: `61378caebdaaa0caecf577ec6f3633765b35b20b`.

The before gallery runs in an isolated temporary copy of the original dev package, using the same local core/framework dependency installation. The after gallery runs from the PR branch. The same route, viewport, theme, and source-panel state are used for each pair. Original examples that generated random values inside accessors can show different data; the PR makes those values repeatable.

See [manifest.json](manifest.json) for exact routes and themes.

| View | Before | After |
| --- | --- | --- |
| gallery | ![Before](gallery-before.png) | ![After](gallery-after.png) |
| search | ![Before](search-before.png) | ![After](search-after.png) |
| plotline-light | ![Before](plotline-light-before.png) | ![After](plotline-light-after.png) |
| plotline-dark | ![Before](plotline-dark-before.png) | ![After](plotline-dark-after.png) |
| graph | ![Before](graph-before.png) | ![After](graph-after.png) |
| treemap | ![Before](treemap-before.png) | ![After](treemap-after.png) |
| transitions | ![Before](transitions-before.png) | ![After](transitions-after.png) |
| bar-styles | ![Before](bar-styles-before.png) | ![After](bar-styles-after.png) |
| xy-labels | ![Before](xy-labels-before.png) | ![After](xy-labels-after.png) |

## Additional states

![Copy feedback](copy-feedback-after.png)

![Narrow sidebar](narrow-sidebar-after.png)
