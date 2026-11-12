<script lang="ts" setup>
import { ItemList, type ItemListProps } from "prez-components";
import { literal } from "prez-lib";

const props = defineProps<ItemListProps>();
const predicate = resolveComponent("Predicate") as Component;
const node = resolveComponent("Node") as Component;
const objects = resolveComponent("Objects") as Component;
const fields = computed(() => props.fields?.map(field =>
    ['https://schema.org/publisher', 'http://schema.org/publisher', 'http://purl.org/dc/terms/publisher'].includes(field.node.value)
        ? { ...field, node: { ...field.node, label: literal('Publisher') } }
        : field
));
</script>

<template>
    <ItemList v-bind="props" :fields="fields" :_components="{ predicate, node, objects }" />
</template>
