# Prez configuration

The endpoint and profile definitions under `config/` are copied into the Prez API
image by the repository's root `Dockerfile`.

## Azure Functions

This directory is also an Azure Functions Python project. It wraps Prez's ASGI
application, uses the remote SPARQL repository configured in `local.settings.json`,
and merges `config/` with Prez's packaged reference data at startup.

From the repository root, prepare and run it with:

```bash
task prez:uv:sync
task prez:dev
```

The local Functions host listens on <http://localhost:7071>. Copy
`local.settings.example.json` to the ignored `local.settings.json` before first use.

Azure deployment uses the repository's root Dockerfile and runs Prez directly through Uvicorn in Azure Container Apps.
The workflow builds and publishes the image and deploys its digest. Terraform supplies runtime environment variables and
a Key Vault reference for the SPARQL password. The local Functions project remains available for emulator testing.
See the repository root README for Azure and GitHub settings.
