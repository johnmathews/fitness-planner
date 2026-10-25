# GitHub Actions pinned to commit SHAs

> Purpose
>
> Why every action in `.github/workflows/` now runs at a fixed commit, what was pinned, and how
> the pins stay current.

## 1. The decision

The home server auto-deploys this app: What's Up Docker redeploys `fitness` within about a minute
of a new `latest` on ghcr (home-server `documentation/wud.md`). The `publish` job in `docker.yml`
holds a token with `packages: write` and ran `docker/login-action` and `docker/build-push-action`
by major tag. A tag can be moved by whoever controls the action's repository (the
tj-actions/changed-files compromise in 2025 did exactly that), so a hijacked tag would have pushed
a malicious image that deploys itself. A commit SHA cannot be moved.

## 2. What changed

- **`ci.yml` and `docker.yml`**: all 19 `uses:` references (9 distinct actions) name a 40-character
  commit SHA, with the release tag as a trailing comment. Nothing was upgraded: each tag was
  resolved to the commit it pointed at on 2026-10-25, and the comment names the most specific
  release tag on that commit.
- **`.github/dependabot.yml`** is new, with the `github-actions` ecosystem on a weekly schedule.

- `actions/checkout` v7 → v7.0.1 (`3d3c42e5aac5`)
- `actions/setup-node` v7 → v7.1.0 (`949feb2413d6`)
- `actions/upload-artifact` v7 → v7.0.2 (`cf430e030ddb`)
- `astral-sh/setup-uv` v10.3.2 (`07a047e608db`)
- `docker/build-push-action` v7 → v7.4.0 (`c3c9e263c25d`)
- `docker/login-action` v4 → v4.7.0 (`81c6f93d4bc9`)
- `docker/metadata-action` v6 → v6.2.0 (`dc8028041006`)
- `docker/setup-buildx-action` v4 → v4.4.1 (`f87e5991a6d7`)
- `docker/setup-qemu-action` v4 → v4.4.0 (`990126619549`)

## 3. Keeping them current

Dependabot understands SHA pins: its pull request replaces the SHA and rewrites the version
comment together. Those pull requests are the routine way a pin changes. Merging one publishes a
new `latest`, so it is a deploy like any other merge.
