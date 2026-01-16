# EduLearn QA & Improvement Roadmap

## Philosophy
Relentless iterative refinement across reliability, usability, accessibility, security, performance, and maintainability. Each cycle: Observe → Measure → Improve → Verify → Document.

## Pillars & Objectives
1. UI/UX Consistency: Centralized design tokens; predictable spacing, typography, motion.
2. Accessibility (a11y): WCAG AA color contrast; keyboard navigability; ARIA labeling; focus visibility.
3. Performance: Efficient bundle size; lazy loading routes & media; image optimization.
4. Reliability: Error boundaries; resilient network layer with retries & cancellation.
5. Security: Input validation, auth hardening, rate limiting, secure headers, sanitized uploads.
6. Observability: Structured logging, request correlation IDs, actionable metrics.
7. Test Coverage: Focused unit tests (utils/components), integration (auth/course flows), smoke E2E.
8. Documentation: Living API spec, architectural decision records (ADRs), clear contribution guide.
9. SEO & Discoverability: Meta tags, Open Graph, semantic HTML, sitemap.
10. Developer Experience: Lint + format + type hints (future), fast CI, pre-commit hooks.

## Initial Sprint (High-Leverage)
- Centralize theme colors via Tailwind config (design tokens).
- Add ErrorBoundary component & integrate at root.
- Implement skeleton loaders for course listing & dashboard metrics.
- Accessibility pass: landmarks (<header>, <nav>, <main>, <footer>), alt text, form labels.
- Add backend request validation layer (Joi/Zod) for auth & course endpoints.
- Introduce helmet + rate limit + improved CORS.
- Logging: Winston transports (console + file) & middleware to log req/res times.
- Add SEO essentials (title strategy, meta description, canonical, Open Graph, favicons).

## Testing Strategy
- Unit: utils (formatters, cn), UI primitives (Button variant mapping), API client (error handling).
- Integration: signup/login → protected route → logout; purchase course flow.
- E2E (later via Playwright): critical navigation + video playback start.
- Performance Budgets: Lighthouse score targets (PWA optional later).

## Metrics & Tooling
- Add GitHub Actions: lint, test matrix (node LTS), build.
- Bundle analysis (rollup/vite plugin) threshold alerts.
- Lighthouse CI (future) + code coverage gate (>=70% rising to 85%).

## Risk & Priority Matrix (Simplified)
High Impact / Low Effort: Theme centralization, error boundary, SEO meta, helmet.
High Impact / Medium Effort: Validation layer, skeleton loaders, logging.
Medium Impact / Low Effort: Accessibility landmarks, alt text audit.

## Continuous Cycle Checklist
1. Identify friction (UX reports, logs).
2. Quantify (metrics, vitals, coverage).
3. Patch & refactor (minimal blast radius).
4. Verify (tests + manual exploratory).
5. Document change (CHANGELOG/ADR).

## ADR Index (Planned)
- UI color tokens vs inline classes.
- Validation strategy (Joi vs Zod vs custom).
- Logging stack (Winston + morgan vs pino).

## Next Actions (Concrete)
- [ ] Tailwind config with custom color palette (red scale, gray scale, semantic tokens).
- [ ] Create ErrorBoundary.jsx and wrap <App />.
- [ ] Add Skeleton components (CourseSkeleton, StatsSkeleton).
- [ ] Implement request validation (auth signup/login, course create/update).
- [ ] Introduce helmet & rate limiter in backend/server.js.
- [ ] Add winston logger module + request logging middleware.
- [ ] Insert SEO meta in index.html.
- [ ] Accessibility audit script/checklist update.

## Definition of "Perfect" (Evolving)
A moving target combining: zero critical bugs, >90 Lighthouse scores, AA accessibility, >85% test coverage, observability baseline (p95 latency tracked), documented architecture, and painless contributor onboarding.

---
This roadmap is versioned; iterate and prune completed items regularly.
