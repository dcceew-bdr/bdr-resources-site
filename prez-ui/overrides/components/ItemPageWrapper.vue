<script lang="ts" setup>
const route = useRoute();
</script>

<template>
    <ItemPage v-if="route.query._profile != 'altr-ext:alt-profile'">
        <template #item-members="{ data, isConceptScheme }">
            <MembersList v-if="data.data.members && !isConceptScheme" :key="route.path" :membersUrl="data.data.members.value" />
        </template>
    </ItemPage>
    <ListPage v-else />
</template>
