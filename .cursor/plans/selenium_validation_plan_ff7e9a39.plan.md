---
name: Selenium Validation Plan
overview: Plan next steps to validate the Expo web experience via Selenium and cover recent LinkedIn scope/profile changes.
todos:
  - id: build-web-target
    content: Build Expo web bundle for selenium target
    status: pending
  - id: selenium-setup
    content: Add Selenium WebDriver config and page objects
    status: pending
    dependencies:
      - build-web-target
  - id: selenium-tests
    content: "Write smoke tests: splash redirect, LinkedIn auth link, feed render"
    status: pending
    dependencies:
      - selenium-setup
  - id: ci-wireup
    content: Hook selenium tests into GitHub Actions
    status: pending
    dependencies:
      - selenium-tests
---

# Selenium Validation Plan

- Build target: use Expo web (`npm run build:web`) to produce static output for Selenium-driven smoke tests.
- Test matrix: run Selenium against the web bundle (local http://localhost:8081 or static `dist` serve) covering auth flows and LinkedIn UX fallbacks.
- Core scenarios: splash redirect to feed, LinkedIn auth URL generation (scope includes `w_member_social`), profile avatar retrieval fallback, feed rendering with stored posts, and error handling when LinkedIn profile ID missing.
- Tooling: set up Selenium WebDriver (Chrome) with basic page objects for splash → feed navigation and LinkedIn connect button/link; add CI hook to run on PR/main.
- Artifacts: store test code under `tests/selenium/` and wire into GitHub Actions alongside lint/typecheck job (reuse Node 22, npm ci).
- Environment: load `.env`/EAS secrets for SUPABASE/LinkedIn client ID/redirect URI in test runs; for server calls, use mock/stub endpoints if secrets absent.