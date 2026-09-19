import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored as-is from the ElevenLabs UI registry. Its imperative
    // three.js/r3f code trips React Compiler's purity checks by design;
    // rewriting it risks breaking the visual it renders.
    "src/components/voice/orb.tsx",
  ]),
]);

export default eslintConfig;
