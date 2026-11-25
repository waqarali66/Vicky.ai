# Vicky AI Film Studio

Current source snapshot exported from the Floot project on 2026-11-25.

## Important runtime note
This repository is a source snapshot of the Floot-hosted Vicky AI Film Studio. It uses Floot project conventions, managed authentication, PostgreSQL connection, API endpoint layout, and component runtime. It is not yet a standalone deployment package. Keep the Floot project as the active working/deployment environment unless a separate migration is completed and tested.

## Current application scope
- Private owner workspace for waqar.aliakbar920@gmail.com
- Owner-only project dashboard and persistent film project library
- Email/password authentication with public registration disabled
- PostgreSQL-backed project records
- Screenplay and media-generation capabilities remain future development; external AI generation providers are not connected yet.

## Secrets and data
No environment secrets or database records are included in this repository snapshot. Configure credentials through the hosting platform's secret manager.
