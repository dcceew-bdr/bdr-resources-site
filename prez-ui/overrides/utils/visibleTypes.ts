export const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

export function isVisibleType(term: { value: string }): boolean {
    return !term.value.startsWith("https://olis.dev/")
        && term.value !== "http://www.w3.org/2000/01/rdf-schema#Resource";
}
