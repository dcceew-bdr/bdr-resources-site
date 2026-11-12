export const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

// OLIS classes are internal metadata and should not appear in type displays.
export const isVisibleType = (node: { value: string }): boolean =>
  !node.value.startsWith("https://olis.dev/");
