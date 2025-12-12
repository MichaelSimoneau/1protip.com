---
name: deployment-and-secrets-sync
overview: Create a secrets sync script, finalize the CI/CD workflow with testing, and refine UI layout and metadata.
todos:
  - id: create-sync-script
    content: Create scripts/sync-secrets.js to sync secrets from .env to GH and Firebase
    status: pending
  - id: create-ci-workflow
    content: Create .github/workflows/deploy.yml with Jest, Selenium, and Firebase Deploy
    status: pending
  - id: verify-tunnel-layout
    content: Verify Tunnel Splash layout and LOGIN text positioning
    status: pending
  - id: verify-meta-tags
    content: Verify social meta tags in _layout.tsx
    status: pending
---

# Deployment and Secrets Sync Plan

This plan consolidates recent instructions into a unified roadmap for deployment automation, secret management, and final UI polish.

## 1. Secrets Synchronization Script

Create a script to sync environment variables from local `.env` files to both GitHub Actions Secrets and Firebase Functions Secrets.

-   **Source Files:**
    -   Root `.env` (or `apps/1protip.com/.env`)
    -   `functions/.env`
-   **Destinations:**
    -   GitHub Repository Secrets (`gh secret set`)
    -   Firebase Project Secrets (`firebase functions:secrets:set`)
-   **Implementation:** Create `scripts/sync-secrets.js` using Node.js.
-   **Dependencies:** Ensure `firebase-tools` is a dev dependency (done). Ensure script checks for `gh` CLI.

## 2. CI/CD Workflow (`.github/workflows/deploy.yml`)

Finalize the GitHub Actions workflow to test, build, and deploy the application.

-   **Triggers:**
    -   PR: Preview deployment.
    -   Main: Production deployment.
-   **Steps:**
    -   Setup Environment (Node, pnpm, Java/Firefox).
    -   Install Dependencies.
    -   **Secrets:** Inject secrets from GitHub Secrets into `.env` files for the build/test environment.
    -   **Testing:**
        -   Run Jest Unit Tests (`pnpm test`).
        -   Run Selenium Smoke Tests (`pnpm test:selenium`).
    -   **Build:** Build the web application (handled by `test:selenium` or explicit step).
    -   **Deploy:** Deploy to Firebase Hosting & Functions using `FirebaseExtended/action-hosting-deploy`.

## 3. Tunnel Splash Layout Refinement

Ensure the "LOGIN" text is correctly positioned below the "in" logo in the tunnel splash animation.

-   **Task:** Verify/Fix `TunnelSplash.tsx` to center "in" perfectly and place "LOGIN" below it.
-   **Verification:** Ensure Selenium test passes or verify visually if possible.

## 4. Meta Tags

Verify social sharing meta tags in `app/_layout.tsx`.

-   **Task:** Confirm `og:`, `twitter:`, and `description` tags are present and correct.