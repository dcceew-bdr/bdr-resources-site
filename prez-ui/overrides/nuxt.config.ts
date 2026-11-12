import { modularVendors } from './build/modular-vendors.mjs';

const vendors = modularVendors();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: true },
    modules: [
      "@nuxtjs/tailwindcss",
      "shadcn-nuxt",
      "@nuxtjs/color-mode",
      (_options, nuxt) => {
          nuxt.hook('components:dirs', (dirs) => {
              for (const dir of dirs) {
                  if (typeof dir === 'string') continue;
                  // shadcn registers index.ts exports separately. Scan only
                  // Vue files, with its explicit registrations taking priority.
                  dir.extensions = ['vue'];
                  if (dir.path.endsWith('/components/ui')) dir.priority = 0;
              }
          });
      },
    ],
    extends: [
        "prez-ui"
    ],
    vite: {
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('/codemirror/')) return 'editor-codemirror';
                        if (id.includes('/jquery/') || id.includes('/datatables.net/')) return 'editor-tables';
                        if (id.includes('/json2csv/')) return 'editor-csv';
                    },
                },
            },
        },
        resolve: { alias: vendors.aliases },
        plugins: [vendors.plugin, {
            name: 'yasgui-modern-css',
            enforce: 'pre',
            transform(code, id) {
                if (!id.endsWith('/@triply/yasgui/build/yasgui.min.css')) return;
                // Remove IE6/7 star hacks; modern declarations are already present.
                return {
                    code: code.replace(/([;{])\*(?:cursor:hand|zoom:1|margin-top:-1px)(?=[;}])/g, '$1'),
                    map: null,
                };
            },
        }],
        server: {
            allowedHosts: [
                "bdr.gov.au",
                "resources.bdr.gov.au",
                "resources.dev.bdr.gov.au"
            ],
            hmr: {
                host: "localhost",
                protocol: "ws",
            },
            // watch: {
            //     usePolling: true
            // }
        },
        optimizeDeps: {
            exclude: ["@triply/yasgui", "@triply/yasqe", "@triply/yasr", "@triply/yasgui-utils"]
        },
    },
    app: {
        head: {
            title: "BDR Resources",
            link: [
                { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap", type: "text/css" }
            ]
        },
    },
    hooks: {
        'pages:extend'(pages) {
            const rootPage = pages.find(page => page.path === '/');
            if (rootPage) {
                rootPage.file = new URL('./pages/index.vue', import.meta.url).pathname;
            }
        },
    },
});
