name: "Phase 4: Tooling, Testing, and CI"
overview: This phase focuses on improving the developer experience, code quality, and deployment confidence. It involves migrating the project to a more efficient package manager (pnpm) and establishing an end-to-end testing suite using Selenium.
derived_from:
  - "pnpm-migration-cli_b406c8e0.plan.md"
  - "selenium_validation_plan_ff7e9a39.plan.md"
todos:
  - id: pnpm-migrate
    content: "Migrate from npm/yarn to pnpm, replacing package-lock.json with pnpm-lock.yaml."
    status: pending
  - id: ci-update-pnpm
    content: "Switch the GitHub Actions CI workflow to use pnpm for installing dependencies and running scripts."
    status: pending
  - id: selenium-setup
    content: "Set up Selenium WebDriver, page objects, and build the Expo web bundle for testing."
    status: pending
  - id: selenium-tests
    content: "Write core smoke tests for the splash redirect, LinkedIn auth flow, and basic feed rendering."
    status: pending
  - id: ci-wireup-selenium
    content: "Integrate the Selenium test suite into the GitHub Actions workflow."
    status: pending
---

# Phase 4: Tooling, Testing, and CI

This phase runs in parallel to feature development and is crucial for the long-term health and stability of the project. It aims to make development more efficient and releases more reliable.

## Key Objectives

1.  **Modernize Tooling:** Switch to `pnpm` for faster, more reliable dependency management.
2.  **Automate End-to-End Testing:** Implement a Selenium test suite to automatically validate critical user flows, such as authentication and feed loading, preventing regressions.
3.  **Enhance CI:** Integrate the new tooling and tests into the continuous integration pipeline.

## Tasks (To-Do)

- **`pnpm-migrate`**: The main task from `pnpm-migration-cli_b406c8e0.plan.md`. This involves generating a `pnpm-lock.yaml` and updating project documentation.
- **`ci-update-pnpm`**: Also from the `pnpm` plan, this requires modifying `.github/workflows/ci.yml` to use pnpm commands.
- **`selenium-setup`**: The setup task from `selenium_validation_plan_ff7e9a39.plan.md`. This includes building the web app, configuring WebDriver, and creating helper classes (page objects).
- **`selenium-tests`**: Writing the actual test cases that cover the core application functionality.
- **`ci-wireup-selenium`**: The final step of the Selenium plan, this involves adding a new job or step to the CI workflow that executes the end-to-end tests.
