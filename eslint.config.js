// eslint.config.js
import pluginEsX from "eslint-plugin-es-x";

export default [
  pluginEsX.configs["flat/no-new-in-es2023"],
  pluginEsX.configs["flat/no-new-in-es2024"],
  pluginEsX.configs["flat/no-new-in-es2025"],
  {
    languageOptions: {
      ecmaVersion: 2022,
    },
  },
];
