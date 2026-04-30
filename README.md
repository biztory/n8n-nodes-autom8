# n8n-nodes-autom8

This repository hosts the **Autom8** family of n8n community nodes for working with Tableau. Each node ships as its own npm package so it can be installed and updated independently.

| Package                                                                                          | Node                              | Purpose                                                                                                          |
| ------------------------------------------------------------------------------------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`@biztory/n8n-nodes-autom8-tableau-action-trigger`](packages/tableau-action-trigger)            | `Autom8 Tableau - Data Action Trigger` | Webhook trigger that receives data from the Autom8 Tableau dashboard extension and exposes it as workflow input. |
| [`@biztory/n8n-nodes-autom8-tableau-alert-trigger`](packages/tableau-alert-trigger)              | `Autom8 Tableau - Data Alert Trigger`  | Polling trigger that watches a Tableau view or datasource and fires when a configured condition is met.          |

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

ℹ️ End-user documentation lives at <https://biztory.atlassian.net/wiki/spaces/A8/pages/1123254273/n8n+Node>.

## Repository layout

```
.
├── package.json              # workspace root (private, not published)
├── tsconfig.base.json        # shared TypeScript compiler options
├── eslint.config.mjs         # shared lint config (uses @n8n/node-cli/eslint)
├── .prettierrc.js            # shared Prettier config
└── packages/
    ├── tableau-action-trigger/   # @biztory/n8n-nodes-autom8-tableau-action-trigger
    └── tableau-alert-trigger/    # @biztory/n8n-nodes-autom8-tableau-alert-trigger
```

This is a standard npm workspaces setup — `npm install` at the root installs dependencies for all packages and creates a single `node_modules`. Each package has its own `package.json`, `tsconfig.json`, `README`, and `CHANGELOG`.

## Development

```sh
# from repo root
npm install
npm run build                                                    # build both packages
npm run build -w @biztory/n8n-nodes-autom8-tableau-action-trigger  # build a single package
npm run lint                                                     # lint everything
```

To work on a single package interactively:

```sh
cd packages/tableau-action-trigger
npm run dev
```

`n8n-node` operates on the package's `cwd`, so all of its commands (`build`, `dev`, `lint`, `release`, `prerelease`) work from inside a package directory or via the `-w <package>` workspace flag.

## Releasing

Each package versions and publishes independently. Releases are kicked off locally and finished by GitHub Actions:

1. From inside the package directory, run `npm run release`. This lints, builds, prompts for a version bump, updates `CHANGELOG.md`, commits, and creates a namespaced git tag (e.g. `tableau-action-trigger/0.4.0`).
2. Pushing the tag triggers the corresponding workflow under `.github/workflows/`, which republishes to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements) attached.
3. Provenance + OIDC publishing is configured per package on npmjs.com (Settings → Publish access → Trusted Publishers).

See each package's workflow file for the exact tag pattern and publish step.

## Compatibility

Tested and supported starting with n8n version **2.13.3**.
