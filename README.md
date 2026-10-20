# BDR Reference Data Catalogue

This repository contains the configuration needed for the configuration of the [Prez](https://prez.dev) tool, as 
deployed for the [Biodiversity Data repository](https://bdr.gov.au)'s reference data catalogue at <https://resources.bdr.gov.au>.

## The tool

The tool used here is [Prez](https://prez.dev/), which is a Linked Data API and UI that makes RDF data available on the
web for humans and machines.

The Prez API runs in Azure Container Apps and PrezUI runs in Azure Static Web Apps. The database
containing the RDF data is a [Fuseki](https://jena.apache.org/documentation/fuseki2/) instance within the BDR's cloud
tenancy.

## Running

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/), including Docker Compose
- [Task](https://taskfile.dev/installation/)

### Configuration

Create the local environment file:

```bash
cp docker/.env.example docker/.env
```

Set `FUSEKI_ADMIN_PASSWORD` and `REFDATA_PASSWORD` in `docker/.env`. The latter is used by the dedicated `refdata`
account shared by the local Fuseki dataset, Prez, and the data loader.

### Running the stack

Build both images:

```bash
task stack:build
```

Start the stack:

```bash
task stack:up
```

This starts Fuseki first and then starts Prez and PrezUI against its `refdata` dataset. Open the catalogue UI at
<http://localhost:3000/catalogs> or the Fuseki UI at <http://localhost:3030/>.

### Loading the reference data

Check out `resources.bdr.gov.au-data` beside this repository and install
[kgm](https://kurrawong.github.io/kgm/). With the stack healthy, load its manifest into the local dataset:

```bash
task data:sync
task fuseki:restart
```

The sync task is the local equivalent of that repository's `resources/kgm-sync.sh`: it reads
`../resources.bdr.gov.au-data/resources/manifest.ttl`, targets `http://localhost:3030/refdata/`, and authenticates as
`refdata`. You may instead pass another manifest directly to `fuseki/kgm-sync.sh`. Restart Fuseki after a load so its
on-disk GeoSPARQL index is rebuilt from the newly loaded data; the Lucene full-text index is maintained during updates.

Other stack commands are:

```bash
task stack:restart
task stack:logs
task stack:down
task stack:clean
```

`stack:clean` removes the stack-owned `fuseki-data` volume and all locally loaded RDF data.

### Running with the Azure Functions emulator

This mode runs the Prez API through Azure Functions Core Tools on port 7071 and
serves a separate UI image configured to use that port.

Prerequisites in addition to Docker and Task are:

- Python 3.12
- [uv](https://docs.astral.sh/uv/)
- Azure Functions Core Tools 4

Create the untracked local Function settings and set the Fuseki password:

```bash
cp prez/local.settings.example.json prez/local.settings.json
```

Build the Functions environment and UI image:

```bash
task functions:build
```

Then:

```bash
task functions:dev
```

`functions:dev` starts the Functions-mode UI in Docker and runs Azure Functions
Core Tools in the foreground. The services are then available at:

- Prez UI: <http://localhost:3000/catalogs>
- Emulated Function App: <http://localhost:7071>

Press Ctrl+C to stop the Functions host, then stop its UI with:

```bash
task functions:down
```

## Services

- **Prez UI:** <http://localhost:3000>
- **Prez API:** <http://localhost:8000>
- **Fuseki:** <http://localhost:3030/refdata/> (persistent TDB2 with Lucene full-text and GeoSPARQL indexes)

## Deploying to Azure

The development deployment uses two independent Azure application resources:

- Prez runs directly through Uvicorn in Azure Container Apps.
- PrezUI is generated as a client-side Nuxt site and deployed to Azure Static Web Apps.

Fuseki runs separately on the VM managed by `resources.bdr.gov.au-infra`.

The workflows under `.github/workflows/` deploy both applications when relevant
files change on `main`. Apply `resources.bdr.gov.au-infra` before enabling them.

### Container App

The Container App, Consumption environment, subnet, logs, runtime settings and Key Vault secret reference are managed by
`resources.bdr.gov.au-infra`. The root Dockerfile includes Prez, repository-owned middleware and `prez/config/`.

The deployment workflow uses the existing GitHub OIDC identity. Terraform grants it Container Apps Contributor on Prez
and AcrPush on the existing registry. Configure these GitHub Actions `dev` environment variables:

```text
AZURE_CLIENT_ID
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
AZURE_CONTAINER_APP_NAME=resources-bdr-dev-prez
AZURE_CONTAINER_REGISTRY_NAME=crbdrdev001
AZURE_RESOURCE_GROUP=resources-bdr-gov-au-rg
```

`.github/workflows/deploy-prez.yml` builds the root Dockerfile for Linux AMD64, publishes a unique image tag and deploys
its immutable digest. Terraform owns runtime configuration and ignores later image releases. The app exposes port 8000
through HTTPS ingress with one minimum replica and startup/readiness probes at `/health`.

The SPARQL endpoint remains `https://fuseki.resources.dev.bdr.gov.au/refdata/sparql`, with username `refdata` and the
password resolved from Key Vault by a managed identity. `CORS_ALLOWED_ORIGIN` is `https://resources.dev.bdr.gov.au`.
Proxy headers are enabled so generated API links use HTTPS. Functions-specific runtime settings are no longer used
for Azure deployment; the Functions emulator remains available for local development.

### Static Web App

The Static Web App is managed by `resources.bdr.gov.au-infra`. Store its
sensitive Terraform deployment-token output as this GitHub Actions repository
or `dev` environment secret:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN=<deployment token>
```

Set `PREZ_API_ENDPOINT` in the GitHub Actions `dev` environment to the `prez_api_endpoint` Terraform output, without
an `/api` suffix. Rebuild and deploy PrezUI whenever that hostname changes.

The workflow in `.github/workflows/deploy-prez-ui.yml` builds the existing
PrezUI Dockerfile with this endpoint, extracts the generated static files, and
deploys them to Static Web Apps. This deliberately reuses the same Docker build
as local testing. `prez-ui/overrides/public/staticwebapp.config.json` provides
the fallback needed when browser routes such as `/catalogues` are opened directly.

Keep `CORS_ALLOWED_ORIGIN` aligned with the UI custom domain. The application middleware emits CORS headers; avoid
adding duplicate headers through platform CORS settings.

### Deployment checks

After the first deployment, verify:

```text
https://<Container App FQDN>/health
https://<Container App FQDN>/catalogues
https://<Static Web App hostname>/catalogues
```

Browser network requests from PrezUI should go directly to the Container App hostname,
must not contain `localhost` or `/api`, and must return exactly one matching
`Access-Control-Allow-Origin` header.

## Image layout

The root `Dockerfile` extends the selected Prez image and copies the configuration
under `prez/config` into the image. The files are stored directly in this repository
so Docker builds do not depend on absolute symlinks or another source checkout.

`prez-ui/Dockerfile` creates an unmodified Prez UI application at the
selected version, generates the static site, and copies it into an Nginx runtime
image.

`docker-compose.yml` builds and runs the three images. The browser-facing API endpoint
is embedded into the static UI at build time through
`NUXT_PUBLIC_PREZ_API_ENDPOINT`.

The derived image under `fuseki/` pins the Kurrawong Fuseki image and supplies the `refdata` dataset assembler and
dedicated user. The assembler wraps a GeoSPARQL-enabled TDB2 dataset in a Lucene `text:TextDataset`; Fuseki exposes the
outer text dataset so both indexes are available to Prez.

The `functions` Compose profile builds only the UI, targeting the local Azure
Functions host at port 7071. The Python Function App under `prez/` merges Prez's
packaged reference data with `prez/config` before assembling the ASGI application.
Both deployment modes wrap Prez with repository-owned response middleware that
removes upstream hop-by-hop headers and emits browser-safe CORS headers. Set
`CORS_ALLOWED_ORIGIN` to the deployed Prez UI origin in Azure.

## License & Copyright

The license for novel content in this repository is the standard Australian government open source license:

* [CC BY 4.0 - Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)

Copyright is

© Department of Climate Change, Energy, the Environment and Water

## Contacts

**Biodiversity Data Repository Team**  
[Department of Climate Change, Energy, the Environment and Water](https://www.dcceew.gov.au)  
<https://bdr.gov.au>  
<bdr@dcceew.gov.au>

For technical contributions, please use the [Issue Tracker](https://github.com/dcceew-bdr/resources.bdr.gov.au-data/issues) 
for this repository.
