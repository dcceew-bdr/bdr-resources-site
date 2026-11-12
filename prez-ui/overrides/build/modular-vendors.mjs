import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

// Use the published source so Vite can share and split the editor's dependencies.
export function modularVendors() {
    const require = createRequire(import.meta.url);
    const editorRequire = createRequire(require.resolve('@triply/yasgui'));
    const packages = ['yasgui', 'yasqe', 'yasr', 'yasgui-utils'];
    const aliases = packages.map(name => ({
        find: new RegExp(`^@triply/${name}$`),
        replacement: editorRequire.resolve(`@triply/${name}/src/index.ts`),
    }));
    aliases.push({ find: /^events$/, replacement: require.resolve('events/') });
    const resultRequire = createRequire(editorRequire.resolve('@triply/yasr'));
    aliases.push({ find: /^json2csv$/, replacement: resultRequire.resolve('json2csv/dist/json2csv.umd.js') });
    const componentRequire = createRequire(require.resolve('prez-components'));
    aliases.push({ find: /^mermaid$/, replacement: componentRequire.resolve('mermaid') });
    for (const name of ['dompurify', 'marked']) {
        aliases.push({ find: new RegExp(`^${name}$`), replacement: componentRequire.resolve(name) });
    }
    const componentsRoot = fileURLToPath(new URL('../vendor/prez-components/', import.meta.url));
    aliases.push({ find: /^prez-components$/, replacement: `${componentsRoot}index.ts` });

    return {
        aliases,
        plugin: {
            name: 'yasgui-source',
            enforce: 'pre',
            resolveId(source) {
                // All supported browsers provide native JSON. The store plugin
                // only installs a fallback on IE8 and earlier and contains eval.
                if (/\/lib\/json2(?:\.js)?$/.test(source)) return '\0yasgui-native-json';
            },
            load(id) {
                if (id === '\0yasgui-native-json') return 'export default {};';
            },
            transform(code, id) {
                if (id.startsWith(componentsRoot)) {
                    code = code.replace('import "./assets/index.css";', '');
                    code = code.replace(/(["'])@\//g, `$1${componentsRoot}`);
                    code = code.replace(/theme\('colors\.([\w-]+)(?:\.DEFAULT)?'\)/g, 'hsl(var(--$1))');
                    return { code, map: null };
                }
                if (!/\/@triply\/(yasgui|yasqe|yasr|yasgui-utils)\/.*\.(ts|js)$/.test(id)) return;
                const imports = [];
                code = code.replace('import * as DOMPurify from "dompurify";', 'import DOMPurify from "dompurify";');
                code = code.replace(/import\s*["'][^"']+\.(?:scss|css)["'];?/g, '');
                code = code.replace(/require\(["']([^"']+)["']\)/g, (_match, source) => {
                    // The page loads Yasgui's complete, precompiled stylesheet.
                    if (/\.(scss|css)$/.test(source)) return 'undefined';
                    const name = `__yasguiImport${imports.length}`;
                    const binding = ['sortablejs', 'column-resizer'].includes(source) ? `* as ${name}` : name;
                    imports.push(`import ${binding} from ${JSON.stringify(source)};`);
                    return name;
                });
                return { code: `${imports.join('\n')}\n${code}`, map: null };
            },
        },
    };
}
