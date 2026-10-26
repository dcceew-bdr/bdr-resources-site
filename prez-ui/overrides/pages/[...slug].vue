<template>
    <NuxtLayout v-if="isLoading" contentonly>
        <template #default>
            <div />
        </template>
    </NuxtLayout>
    <ItemPageWrapper v-else-if="matchResult.isObjectMatch" />
    <ListPage v-else-if="matchResult.isListingMatch">
        <template v-if="route.path === '/catalogues'" #top>
            <div class="max-w-6xl leading-relaxed mb-6">
                <p>
                  The catalogues listed here contain resources of particular types -
                  vocabularies, datasets etc. - that are loaded into the BDR. Some of the
                  items in these catalogues are developed for and so-far only found here, but
                  others are managed elsewhere and reused here, such as TERN's vocabularies
                  for scientific survey protocols.
                </p>

                <p>
                  The catalogues themselves conform to the
                  <a href="https://www.w3.org/TR/vocab-dcat-3/"
                    >Data Catalog Vocabulary (DCAT)</a
                  >
                  and
                  <a href="https://schema.org">schema.org</a> models.
                </p>

                <p>
                  The catalogues of data listed here contain the main information of
                  biodiversity observations stored within the BDR. The content in these
                  catalogues conforms to the
                  <a href="https://linked.data.gov.au/def/abis">ABIS</a> standard.
                </p>

                <p>
                  The catalogues of vocabularies support the main biodiversity observations
                  and contain environmental and biodiversity classifications, including soil
                  and landscape survey methodologies, land use management classifications,
                  ecological monitoring method lists, and many technical and management
                  vocabularies used for data access and governance. These vocabularies
                  conform to the well-known
                  <a href="https://www.w3.org/2004/02/skos/"
                    >Simple Knowledge Organization System (SKOS)</a
                  >
                  model, and specifically, the
                  <a href="https://w3id.org/profile/vocpub/spec">VocPub</a> profile of it.
                  This helps to ensure consistent data collection and interpretation across
                  Australia's biodiversity monitoring and research efforts and allows for the
                  validation of new vocabs and additions to existing ones.
                </p>
            </div>
        </template>
    </ListPage>
    <NuxtLayout v-else contentonly>
      <template #default>
          <h1 class="text-2xl mt-8">Page not found</h1>
          <p>Sorry, this page does not exist.</p>
          <ItemLink to="/">Go home</ItemLink>
      </template>
  </NuxtLayout>
</template>

<script setup lang="ts">

const route = useRoute();
const globalConfig = useGlobalConfig();

const isLoading = computed(() => !globalConfig.value);

const matchResult = computed(() => {
  if (isLoading.value || !globalConfig.value) {
    return { isObjectMatch: false, isListingMatch: false };
  }

  const currentPath = route.path;
  const objectEndpoints = globalConfig.value.objectEndpoints || [];
  const listingEndpoints = globalConfig.value.listingEndpoints || [];

  const isObjectMatch = matchesAnyPattern(currentPath, objectEndpoints);
  const isListingMatch = !isObjectMatch && matchesAnyPattern(currentPath, listingEndpoints);

  return { isObjectMatch, isListingMatch };
});
</script>
