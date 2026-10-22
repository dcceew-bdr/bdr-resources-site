<script lang="ts" setup>
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
</script>

<template>
    <section class="mt-8">
        <h2 class="text-2xl mb-4">Members</h2>
        <Message v-if="error" severity="error">{{ error }}</Message>
        <Loading v-else-if="status == 'pending'" />
        <template v-else-if="data?.data">
            <ItemList v-if="globalProfiles && currentProfile" :fields="globalProfiles?.[currentProfile?.uri || '']" :list="data.data" :key="urlPath" />
            <Loading v-else />
            <PrezPagination :totalItems="data.count" :pagination="pagination" :maxReached="data.maxReached" />
        </template>
    </section>
</template>
