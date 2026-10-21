---
name: Replit managed workflow working directory
description: Relative path behavior for artifact-owned development services in this project.
---

For FocusFlow artifact-owned development services, command paths resolve from the artifact directory, while ad-hoc shell commands run from the workspace root. Use artifact-relative paths for application imports and `../..` for root project files in development commands. Production command paths have not been verified.

**Why:** A backend command using a workspace-relative application path failed to import the app, while the equivalent artifact-relative path started successfully.

**How to apply:** When configuring managed development service commands, verify path resolution from the service's working directory instead of assuming it matches an ad-hoc shell.
