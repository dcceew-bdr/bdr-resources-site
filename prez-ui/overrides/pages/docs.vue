<script lang="ts" setup>
const apiEndpoint = useGetPrezAPIEndpoint();
const appConfig = useAppConfig();
const docsUrl = computed(() => '/swagger.html?' + new URLSearchParams({ endpoint: apiEndpoint }).toString());
</script>

<template>
    <NuxtLayout>
        <template #breadcrumb>
            <ItemBreadcrumb :custom-items="[...appConfig.breadcrumbPrepend, { label: 'API Documentation' }]" />
        </template>
        <template #header-text>API Documentation</template>
        <template #default>
            <iframe :src="docsUrl" class="min-h-[800px] w-full mt-4" frameborder="0" title="Prez API Swagger Docs"></iframe>
        </template>
    </NuxtLayout>
</template>
