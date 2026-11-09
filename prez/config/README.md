# Prez configuration data

The endpoint override maps BDR's `/catalogues` routes to a `schema:DataCatalog` hierarchy using `rdfs:member` for catalogue-to-resource, dataset-to-container and container-to-item relationships. The former `/catalogs` route is intentionally not configured.

Following Nick's membership direction on 9 November 2026, these container paths use `rdfs:member` consistently rather than `schema:hasPart` or `dcterms:hasPart`. Publishers and synchronization procedures must supply the corresponding membership triples; changing API configuration does not migrate stored data. This replaces the earlier proposed dual-predicate catalogue paths.

SKOS scheme membership (`skos:inScheme`), top-concept links and collection membership (`skos:member`) retain their SKOS meaning. The OGC Records profile may still display genuine part–whole properties; listing a property in a response profile does not make it a container traversal path.
