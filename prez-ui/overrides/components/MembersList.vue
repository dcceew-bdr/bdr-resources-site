<script lang="ts" setup>
import { literal, node, type PrezFocusNode, type PrezLiteral, type PrezProfile, type PrezTerm } from "prez-lib";
import { isVisibleType, RDF_TYPE } from "../utils/visibleTypes";

const props = defineProps<{
    membersUrl: string;
    directMembers?: PrezTerm[];
    definingResourceIri?: string;
    isValidator?: boolean;
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
        _profile: 'prez:OGCListingProfile',
    }).toString();
}, { immediate: true });

const { status, error, data } = useGetList(useGetPrezAPIEndpoint(), urlPath);
const currentProfile = computed(() => data.value ? data.value.profiles.find(p => p.current) : undefined);
const keywordsIri = 'https://schema.org/keywords';
const definingModelIri = 'http://www.w3.org/2000/01/rdf-schema#isDefinedBy';
const hiddenFields = new Set([
    keywordsIri,
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    'http://example.com/shacl-extension#allPredicateValues',
]);
const memberFields = computed<PrezProfile>(() => {
    if (props.definingResourceIri) {
        return [
            { node: node({ value: RDF_TYPE, label: literal('Type') }) },
            { node: node({ value: definingModelIri, label: literal(props.isValidator ? 'Defining Shapes Graph' : 'Defining Model') }) },
        ];
    }
    const fields = globalProfiles.value?.[currentProfile.value?.uri || ''] ?? [];
    // Keep exactly one Keywords column, including when a profile already supplies it.
    return [
        ...fields.filter(field => !hiddenFields.has(field.node.value)),
        { node: node({ value: keywordsIri, label: literal('Keywords') }) },
    ];
});
const labelCollator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
const labelPredicates = [
    'http://www.w3.org/2000/01/rdf-schema#label',
    'https://schema.org/name',
    'http://schema.org/name',
    'http://www.w3.org/2004/02/skos/core#prefLabel',
];
const listedMembers = computed(() => {
    const members = [...(data.value?.data ?? [])];
    // The API omits members with no outgoing triples. Recover these references
    // when the entire listing fits on one page, without duplicating paginated results.
    if (data.value && data.value.count <= pagination.value.limit && pagination.value.page === 1) {
        const listed = new Set(members.map(member => member.value));
        for (const member of props.directMembers ?? []) {
            if (member.termType === 'NamedNode' && !listed.has(member.value)) {
                members.push(member as PrezFocusNode);
                listed.add(member.value);
            }
        }
    }
    return members;
});
const sortedMembers = computed(() => listedMembers.value.map(member => {
    const label = member.label ?? labelPredicates.flatMap(predicate =>
        member.properties?.[predicate]?.objects ?? []
    ).find((term): term is PrezLiteral => term.termType === 'Literal' && !!term.value.trim());
    return {
        ...member,
        label,
        links: member.links?.length ? member.links : [{
            value: member.curie
                ? `${props.membersUrl}/${encodeURIComponent(member.curie)}`
                : `/object?${new URLSearchParams({ uri: member.value })}`,
            parents: [],
        }],
    };
}).sort((a, b) => {
    const aLabel = a.label?.value?.trim() || a.curie || a.value;
    const bLabel = b.label?.value?.trim() || b.curie || b.value;
    return labelCollator.compare(aLabel, bLabel) || labelCollator.compare(a.value, b.value);
}));
const displayedMembers = computed(() => {
    if (!props.definingResourceIri) return sortedMembers.value;
    return sortedMembers.value.map(member => {
        const typeLabels: Record<string, string> = {
            'http://www.w3.org/2002/07/owl#Class': 'Class',
            'http://www.w3.org/2000/01/rdf-schema#Class': 'Class',
            'http://www.w3.org/2002/07/owl#ObjectProperty': 'Object Property',
            'http://www.w3.org/2002/07/owl#DatatypeProperty': 'Datatype Property',
            'http://www.w3.org/2002/07/owl#AnnotationProperty': 'Annotation Property',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property': 'Property',
        };
        const types = (member.rdfTypes ?? member.properties?.[RDF_TYPE]?.objects ?? [])
            .filter(isVisibleType)
            .filter((type, index, all) => all.findIndex(other =>
                (typeLabels[other.value] ?? other.value) === (typeLabels[type.value] ?? type.value)
            ) === index)
            .map(type => typeLabels[type.value] ? { ...type, label: literal(typeLabels[type.value]) } : type);
        const definingModels = (member.properties?.[definingModelIri]?.objects ?? [])
            .map(model => model.value === props.definingResourceIri ? literal('here') : model);
        return {
            ...member,
            properties: {
                ...member.properties,
                [RDF_TYPE]: { predicate: node(RDF_TYPE), objects: types },
                [definingModelIri]: { predicate: node(definingModelIri), objects: definingModels },
            },
        };
    });
});
</script>

<template>
    <section class="mt-8">
        <h2 class="text-2xl mb-4">Members</h2>
        <Message v-if="error" severity="error">{{ error }}</Message>
        <Loading v-else-if="status == 'pending'" />
        <template v-else-if="data?.data">
            <ItemList v-if="globalProfiles && currentProfile" :fields="memberFields" :list="displayedMembers" :key="urlPath" />
            <Loading v-else />
            <PrezPagination :totalItems="data.count" :pagination="pagination" :maxReached="data.maxReached" />
        </template>
    </section>
</template>
