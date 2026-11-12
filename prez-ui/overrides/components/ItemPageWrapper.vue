<script lang="ts" setup>
import { isVisibleType } from "../utils/visibleTypes";

const route = useRoute();
const isValidatorsCatalogue = computed(() => /^\/catalogues\/validators:?(?:\/|$)/.test(decodeURIComponent(route.path)));

function isValidatorObject(term: { rdfTypes?: { value: string }[] }): boolean {
    return isValidatorsCatalogue.value && !!term.rdfTypes?.some(type =>
        type.value === 'http://www.w3.org/ns/shacl#ShapesGraph'
        || type.value === 'http://www.w3.org/2002/07/owl#Ontology'
    );
}
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
        <template #item-members="{ data }">
            <!-- Keep a real slot node when hidden so Vue does not render ItemPage's fallback Members button. -->
            <div>
                <MembersList
                    v-if="data.data.members && !data.data.rdfTypes?.some(type => type.value === 'http://www.w3.org/2004/02/skos/core#ConceptScheme')"
                    :key="route.path" :membersUrl="data.data.members.value"
                    :defining-resource-iri="isValidatorObject(data.data) || data.data.rdfTypes?.some(type => type.value === 'http://www.w3.org/2002/07/owl#Ontology') ? data.data.value : undefined"
                    :is-validator="isValidatorObject(data.data)"
                    :direct-members="data.data.properties?.['http://www.w3.org/2000/01/rdf-schema#member']?.objects" />
            </div>
        </template>
    </ItemPage>
    <ListPage v-else />
</template>
