<script lang="ts" setup>
import { ItemTableRow, type ItemTableRowProps } from "prez-components";
import { RDF_TYPE } from "../utils/visibleTypes";

const props = defineProps<ItemTableRowProps>();
const predicate = resolveComponent("Predicate") as Component;
const objects = resolveComponent("Objects") as Component;
const hiddenPredicates = new Set([
    RDF_TYPE,
    "http://www.w3.org/2000/01/rdf-schema#member",
    "http://www.w3.org/2004/02/skos/core#hasTopConcept",
]);
</script>

<template>
    <ItemTableRow v-if="!hiddenPredicates.has(props.predicate.value)" v-bind="props" :_components="{ predicate, objects }">
        <template v-if="$slots.row" #row="slotProps"><slot name="row" v-bind="slotProps" /></template>
        <template v-if="$slots.columns" #columns="slotProps"><slot name="columns" v-bind="slotProps" /></template>
    </ItemTableRow>
</template>
