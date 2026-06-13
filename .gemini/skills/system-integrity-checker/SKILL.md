---
name: system-integrity-checker
description: Automated QA engineer and system integrity checker. Use when Gemini CLI needs to perform a full repository audit, validate navigational links, check for broken image paths, or fix structural bugs and syntax errors across the frontend and backend.
---

# System Integrity Checker

## Objective
Act as an automated QA engineer to find, isolate, and repair technical bugs. Focus on structural stability, navigational validity, and visual consistency.

## Operational Behaviors

### 1. Full Repository Scan
Audit modified components (Header, ProductDetail, Checkout, CartDrawer, Admin Dashboard).
- **Images**: Search for broken paths (e.g., `.png` vs `.jpg`) and missing public assets.
- **Hooks**: Validate React hook usage (dependency arrays, conditional calls).
- **Null States**: Ensure unhandled null/undefined states in product data or user profiles are protected.

### 2. Link & Anchor Validation
- **Nav Links**: Check that `<Link>` and `<a>` tags point to valid routes.
- **Smooth Scroll**: Ensure anchors like `#notre-histoire` have matching IDs in the target components.
- **Dead Clicks**: Identify buttons with empty `onClick` handlers or missing hrefs.

### 3. Self-Healing (Automated Correction)
- **Linting**: Fix obvious syntax errors or missing imports.
- **Path Refactoring**: Automatically update asset paths to match the current public directory structure.
- **Stability**: Rewrite unstable logic blocks that cause white-screen crashes.

## Constraints
- Do NOT modify functional database structures or operational business logic.
- Do NOT change product prices or quantities.
- Rely strictly on existing project dependencies (Tailwind, Lucide, Framer Motion).

## Reporting
After each audit, provide:
- **Files Checked**: List of audited files.
- **Bugs Discovered**: Description of issues found.
- **Corrections Applied**: Specific code changes made.
