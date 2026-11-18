<script lang="ts" setup>
import { ItemList, type ItemListProps } from "prez-components";
import { literal } from "prez-lib";

const props = defineProps<ItemListProps>();
const route = useRoute();
const catalogueHiddenFields = new Set([
    'https://schema.org/keywords',
    'http://schema.org/keywords',
    'http://example.com/shacl-extension#allPredicateValues',
]);
const predicate = resolveComponent("Predicate") as Component;
const node = resolveComponent("Node") as Component;
const objects = resolveComponent("Objects") as Component;
const fields = computed(() => props.fields?.filter(field =>
    route.path.replace(/\/$/, '') !== '/catalogues' || !catalogueHiddenFields.has(field.node.value)
).map(field =>
    ['https://schema.org/publisher', 'http://schema.org/publisher', 'http://purl.org/dc/terms/publisher'].includes(field.node.value)
        ? { ...field, node: { ...field.node, label: literal('Publisher') } }
        : field
));
</script>

<template>
    <ItemList v-bind="props" :fields="fields" :_components="{ predicate, node, objects }" />
</template>
