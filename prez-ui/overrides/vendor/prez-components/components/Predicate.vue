<script lang="ts" setup>
import type { PredicateProps } from "@/types";

const props = withDefaults(defineProps<PredicateProps>(), {
    _components: () => {
        return {
            node: Node,
        }
    }
});

</script>

<template>
    <!-- Predicate -->
    <slot>
        <component :is="props._components.node" :term="props.predicate" :variant="props.variant" />
    </slot>
</template>
