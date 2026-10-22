<script lang="ts" setup>
const route = useRoute();
const isCatalogue = computed(() => /^\/catalogues\/[^/]+\/?$/.test(route.path));
</script>

<template>
    <ItemPage v-if="route.query._profile != 'altr-ext:alt-profile'">
        <template v-if="isCatalogue" #item-members="{ data }">
            <MembersList v-if="data.data.members" :key="route.path" :membersUrl="data.data.members.value" />
        </template>
    </ItemPage>
    <ListPage v-else />
</template>
