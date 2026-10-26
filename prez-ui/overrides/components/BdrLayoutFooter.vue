<script setup lang="ts">
import { Facebook, Instagram, Linkedin } from "lucide-vue-next";

const footerLinks = [
    { label: "Contact us", url: "https://www.dcceew.gov.au/about/contact" },
    { label: "Accessibility", url: "https://www.dcceew.gov.au/about/accessibility" },
    { label: "Disclaimer", url: "https://www.dcceew.gov.au/about/disclaimer" },
    { label: "Privacy", url: "https://www.dcceew.gov.au/about/commitment/privacy" },
    { label: "FOI", url: "https://www.dcceew.gov.au/about/reporting/freedom-of-information" },
    { label: "Copyright", url: "https://www.dcceew.gov.au/about/copyright" },
];

const socialLinks = [
    { label: "Facebook", url: "https://www.facebook.com/DCCEEW", icon: Facebook },
    { label: "Instagram", url: "https://www.instagram.com/dcceew", icon: Instagram },
    { label: "LinkedIn", url: "https://www.linkedin.com/company/dcceew", icon: Linkedin },
];
</script>

<template>
    <footer class="bg-tertiary text-tertiary-foreground pt-4 pb-6">
        <div class="container mx-auto px-4 md:grid md:grid-cols-[auto_1fr] md:gap-x-10 md:items-end">
            <nav class="flex flex-wrap justify-center items-center font-semibold text-lg md:col-span-2">
                <template v-for="(link, index) in footerLinks" :key="link.label">
                    <span v-if="index > 0" class="mx-3 h-4 border-l border-tertiary-foreground/60" aria-hidden="true"></span>
                    <a :href="link.url" target="_blank" rel="noopener noreferrer" class="hover:underline">{{ link.label }}</a>
                </template>
            </nav>

            <img src="/energy.png" alt="" class="w-44 hidden md:block">

            <div class="mt-6 flex flex-col md:flex-row gap-6 md:items-end">
                <div class="text-sm font-light leading-relaxed max-w-xl">
                    <p>We acknowledge the Traditional Owners of Country throughout Australia and recognise their continuing connection to land, waters and culture. We pay our respects to their Elders past and present.</p>
                    <p class="mt-6">
					<a href="https://www.dcceew.gov.au/about/copyright" target="_blank" rel="noopener noreferrer" class="hover:underline">&copy; Department of Climate Change, Energy, the Environment and Water</a>
					</p>
                </div>

                <div class="md:ml-auto flex flex-col md:items-end gap-3">
                    <span class="text-sm font-semibold">Connect with us</span>
                    <div class="flex gap-3">
                        <a
                            v-for="social in socialLinks"
                            :key="social.label"
                            :href="social.url"
                            :aria-label="social.label"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="w-9 h-9 rounded-full bg-tertiary-foreground text-tertiary flex items-center justify-center hover:opacity-80"
                        >
                            <component :is="social.icon" class="w-5 h-5" />
                        </a>
                    </div>
                    <a href="https://www.dcceew.gov.au" target="_blank" rel="noopener noreferrer" class="mt-3">
                        <img src="/dcceew-footer.05.2024.png" alt="dcceew.gov.au" class="h-14">
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>
