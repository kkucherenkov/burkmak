# Security Policy

## Supported versions

This is a boilerplate template, not a long-lived library. Only the `main`
branch receives security updates. Downstream forks are the responsibility
of the fork maintainer.

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Instead:

1. Use GitHub's **Private Vulnerability Reporting** (Security tab →
   "Report a vulnerability") on the upstream repository, or
2. Email the maintainer listed in `git log` on `main`.

Include:

- A description of the issue and its potential impact
- Steps to reproduce (minimal repro preferred)
- Affected commit / tag
- Any suggested remediation, if you have one

## Response expectations

- **Acknowledgement:** within 72 hours
- **Triage + severity assessment:** within 7 days
- **Fix timeline:** proportional to severity — critical issues get an
  out-of-band patch; lower-severity fixes land in the next regular commit

## Out of scope

The following are known properties of the template and are not treated as
vulnerabilities in this repo (though they may be in your derived product):

- Default credentials in `docker/compose.yml` — they exist only for local
  development and must be replaced before deployment.
- Mock SMS / email / storage services in `apps/backend` dev environment —
  enabled only when `NODE_ENV !== 'production'`.
- Sample tokens or secrets in documentation and tests — flagged as examples.

## Related documentation

See [`.claude/docs/security.md`](.claude/docs/security.md) for the project's
security conventions, observability setup, and the guardrails already in CI
(license-checker allowlist, TruffleHog secret scanning, `pnpm audit` at
`high` severity).
