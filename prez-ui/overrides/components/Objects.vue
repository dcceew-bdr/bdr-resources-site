<script setup>
import { computed } from "vue";
import { Objects } from "prez-components";
import { isVisibleType, RDF_TYPE } from "../utils/visibleTypes";

const props = defineProps({
  predicate: { type: Object, required: true },
  objects: { type: Array, required: true },
  term: { type: Object, required: true },
});
const term = resolveComponent("Term");

const objects = computed(() =>
  props.predicate.value === RDF_TYPE
    ? props.objects.filter(isVisibleType)
    : props.objects,
);

const columnClass = computed(() =>
  props.predicate.value === "https://schema.org/publisher" ? "bdr-publisher-column" : undefined,
);
</script>

<template>
  <Objects v-bind="props" :class="columnClass" :objects="objects" :_components="{ term }">
    <template #default="slotProps"><slot v-bind="slotProps" /></template>
  </Objects>
</template>

<style>
.bdr-publisher-column {
  width: 50%;
  max-width: 50%;
}
</style>
