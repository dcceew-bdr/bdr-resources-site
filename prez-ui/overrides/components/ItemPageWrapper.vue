<script lang="ts" setup>
import { isVisibleType } from "../utils/visibleTypes";

const route = useRoute();
</script>

<template>
    <ItemPage v-if="route.query._profile != 'altr-ext:alt-profile'">
        <template #header-identifiers="{ data }">
            <div class="mb-2 mt-2 flex flex-row items-center">
                <Badge variant="secondary" class="mr-2 rounded-md">IRI</Badge>
                <ItemLink :secondary-to="data.data.value" copy-link>{{ data.data.value }}</ItemLink>
            </div>
            <div v-if="data.data.rdfTypes?.some(isVisibleType)" class="flex flex-row gap-3">
                <Badge variant="secondary" class="self-start rounded-md">Type</Badge>
                <div>
                    <div v-for="rdfType in data.data.rdfTypes.filter(isVisibleType)" :key="rdfType.value">
                        <Node :term="rdfType" />
                    </div>
                </div>
            </div>
        </template>
        <template #item-members="{ data, isConceptScheme }">
            <MembersList v-if="data.data.members && !isConceptScheme" :key="route.path" :membersUrl="data.data.members.value" />
        </template>
    </ItemPage>
    <ListPage v-else />
</template>
