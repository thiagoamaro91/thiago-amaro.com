# Changelog

## [2026-07-23]

### Added
- Created GitHub repo `thiagoamaro91/thiago-amaro.com` (public)
- Enabled GitHub Pages on `main` root with custom domain, HTTPS enforced
  (cert issuance stalled >1h45 past normal window; fixed by removing/re-adding
  the custom domain via the Pages API to retrigger issuance)
- Configured Cloudflare DNS on the existing thiago-amaro.com zone: 4x A
  records (185.199.108-111.153) + CNAME `www` -> `thiagoamaro91.github.io`,
  all DNS-only (unproxied, required for GitHub's cert to issue)
- Enabled Cloudflare Email Routing: MX/SPF/DKIM live, `hello@thiago-amaro.com`
  forwards to `thiagoamaro91@gmail.com`, verified end-to-end with two test
  emails
- Site is live at thiago-amaro.com

### Changed
- Rewrote the About section's "So I built things" paragraph across several
  rounds of edits: added a "learning became useful" arc, a paragraph on
  Claude coordinating the family's Prague-to-Madrid move plus home
  network/automation work, and a paragraph on learning LLM "primitives"
  (context/memory management, skills, workflows, skeptic review rounds,
  monitoring loops, skill-improving loops, a nightly memory-reorganization
  routine)
- Raised the "hours spent with LLMs" figure from "two to three thousand" to
  "four to five thousand"
- Moved that paragraph to the left column for layout balance
- Commits: `ea7fb23`, `ac7b16d`, `0a5f68b`, `655e790`
