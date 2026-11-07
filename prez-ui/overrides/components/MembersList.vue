<script lang="ts" setup>
import { literal, node, type PrezProfile } from "prez-lib";

const props = defineProps<{
    membersUrl: string;
}>();

const route = useRoute();
const { globalProfiles } = useGlobalProfiles();
const { pagination } = usePageInfo();

// set before useGetList, which fetches immediately
const urlPath = ref('');
watch(() => route.fullPath, () => {
    const { page, limit } = pagination.value;
    urlPath.value = props.membersUrl + '?' + new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    }).toString();
}, { immediate: true });

const { status, error, data } = useGetList(useGetPrezAPIEndpoint(), urlPath);
const currentProfile = computed(() => data.value ? data.value.profiles.find(p => p.current) : undefined);
const keywordsIri = 'https://schema.org/keywords';
const memberFields = computed<PrezProfile>(() => {
    const fields = globalProfiles.value?.[currentProfile.value?.uri || ''] ?? [];
    // Keep exactly one Keywords column, including when a profile already supplies it.
    return [
        ...fields.filter(field => field.node.value !== keywordsIri),
        { node: node({ value: keywordsIri, label: literal('Keywords') }) },
    ];
});
const labelCollator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
const sortedMembers = computed(() => [...(data.value?.data ?? [])].sort((a, b) => {
    const aLabel = a.label?.value?.trim() || a.curie || a.value;
    const bLabel = b.label?.value?.trim() || b.curie || b.value;
    return labelCollator.compare(aLabel, bLabel) || labelCollator.compare(a.value, b.value);
}));
</script>

<template>
    <section class="mt-8">
        <h2 class="text-2xl mb-4">Members</h2>
        <Message v-if="error" severity="error">{{ error }}</Message>
        <Loading v-else-if="status == 'pending'" />
        <template v-else-if="data?.data">
            <ItemList v-if="globalProfiles && currentProfile" :fields="memberFields" :list="sortedMembers" :key="urlPath" />
            <Loading v-else />
            <PrezPagination :totalItems="data.count" :pagination="pagination" :maxReached="data.maxReached" />
        </template>
    </section>
</template>
