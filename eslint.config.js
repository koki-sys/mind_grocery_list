// eslint.config.js
import { defineConfig } from "eslint/config";
import pluginEsX from "eslint-plugin-es-x";

export default defineConfig([
    pluginEsX.configs["restrict-to-es2022"],
    pluginEsX.configs["restrict-to-es2022-intl-api"],
    {
        languageOptions: {
            ecmaVersion: 2022,
        },
        rules: {
            "func-style": ["error", "expression"],
            "no-var": "error",
            "prefer-const": "error",
            "no-const-assign": "error",
            "no-unassigned-vars": "error",
        },
    },
]);
