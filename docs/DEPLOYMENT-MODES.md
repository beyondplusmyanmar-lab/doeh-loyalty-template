# Deployment Modes

DOEH does **not** assume containers. If you run Node, Bun, PHP-FPM, nginx, and systemd
on a VPS or bare-metal host, you are using a **first-class** deployment model — that is
exactly how DOEH itself runs in production.

This page sets expectations so you don't go looking for a Kubernetes chart that isn't
coming, and don't think you *need* Docker when you don't.

## Supported (first-class)

| | |
|---|---|
| ✅ Bare metal | Run directly on the host. |
| ✅ VPS | The common case (single host, systemd). |
| ✅ systemd | Recommended for long-running services (the broker ships a unit). |
| ✅ PM2 | Fine alternative process manager for the Node broker. |
| ✅ Node.js | The broker's runtime. |
| ✅ Bun | The broker is plain ESM and runs under Bun too (`bun run src/index.js`). |

## Optional

| | |
|---|---|
| ⚪ Docker | A `Dockerfile` is provided for the broker for teams that prefer it. |
| ⚪ Docker Compose | A `docker-compose.yml` is provided as a convenience, not a requirement. |

Containers are supported as *examples*, not as the assumed path. Nothing in the template
or broker depends on them.

## Not targeted

| | |
|---|---|
| ❌ Kubernetes / Helm | Out of scope for the reference stack. |
| ❌ ECS / Fargate | Out of scope. |
| ❌ Nomad | Out of scope. |

These can be built on top if your org needs them, but they are not maintained here and no
examples are provided.

## Component packaging doctrine

How each DOEH piece is packaged and run — the through-line is "native services, containers
optional":

| Component | Packaging | Run as |
|---|---|---|
| SDK (`@beyondplusmm/doehpos-sdk`) | npm package | imported by apps |
| Starter kits (this repo) | Expo repo | `pnpm` + Expo / EAS |
| Reference broker | Node / Bun app | **systemd** (or PM2); Docker optional |
| Developer portal | static build | served by nginx |
| Sandbox API | nginx + PHP-FPM | native services |
| Edge gateway | Go binary | systemd |
| Monitoring | native services | systemd timers |
| Docker | — | optional examples only |

## The broker, concretely

The reference token broker (`broker/`) is the one long-running service most adopters will
deploy. Its recommended production path is systemd:

```bash
sudo cp broker/deploy/doeh-broker.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now doeh-broker
journalctl -u doeh-broker -f
```

There is no build step — it runs `src/index.js` directly. See
[`broker/README.md`](../broker/README.md) for development, systemd, and Docker variants.
