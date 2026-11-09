<script lang="ts" setup>
import { computed, type Component } from "vue";
import { SearchResults, type SearchResultsProps } from "prez-components";
import { isVisibleType, RDF_TYPE } from "../utils/visibleTypes";

const props = defineProps<SearchResultsProps>();
const rdfType = RDF_TYPE;

const results = computed(() => props.results.map((result) => ({
  ...result,
  resource: {
    ...result.resource,
    rdfTypes: result.resource.rdfTypes?.filter(isVisibleType),
    properties: result.resource.properties?.[rdfType]
      ? {
          ...result.resource.properties,
          [rdfType]: {
            ...result.resource.properties[rdfType],
            objects: result.resource.properties[rdfType].objects.filter(isVisibleType),
          },
        }
      : result.resource.properties,
  },
})));

const node = resolveComponent("Node") as Component;
const term = resolveComponent("Term") as Component;
const literal = resolveComponent("Literal") as Component;
const itemLink = resolveComponent("ItemLink") as Component;
</script>

<template>
  <SearchResults
    v-bind="props"
    :results="results"
    :_components="{ node, term, literal, itemLink }"
  />
</template>
