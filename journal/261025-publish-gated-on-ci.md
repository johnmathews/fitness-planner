# Publishing waits for CI

Until now `publish` in `.github/workflows/docker.yml` ran on every push to `main`, beside `ci.yml`
rather than after it. A commit that failed lint, the tests, the design-system gate or the API's
`pip-audit` still pushed `latest` to GHCR. The home server is moving to auto-deploy: a What's Up
Docker sidecar on the infra VM polls GHCR every minute and recreates `fitness` and `fitness-api`
when the `latest` digest changes. So an image on GHCR is now a production deploy.

## Decisions

- **`publish` runs on `workflow_run` after `CI` completes on `main`**, and only when it concluded
  `success` on a `push`. This is the same pattern as family-finances' `images.yml`. `ci.yml` is
  unchanged. PR-time `build` and `compose` still run on `pull_request`.
- **It builds exactly the commit CI passed.** A `workflow_run` starts on the default branch's newest
  commit, which can be newer than the one CI checked, so the checkout uses
  `workflow_run.head_sha`, and metadata-action uses `context: git` so `sha-<short>` names that same
  commit.
- **`latest` is unconditional.** `{{is_default_branch}}` reads the workflow's ref, and the trigger is
  already limited to `main`.
- The cost is a slower path from merge to deploy: publish now starts after the slowest CI job
  (`e2e`) instead of beside it.
