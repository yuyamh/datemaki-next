/** @typedef  {import("prettier").Config} PrettierConfig */
/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig } */
const config = {
    arrowParens: "always",
    importOrder: [
        "<TYPES>",
        "^(react/(.*)$)|^(react$)|^(react-native(.*)$)",
        "^(next/(.*)$)|^(next$)",
        "^(expo(.*)$)|^(expo$)",
        "<THIRD_PARTY_MODULES>",
        "",
        "<TYPES>^@acme",
        "^@acme/(.*)$",
        "",
        "<TYPES>^[.|..|~]",
        "^~/",
        "^[../]",
        "^[./]",
    ],
    importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
    importOrderTypeScriptVersion: "5.8.3",
    plugins: [
        "@ianvs/prettier-plugin-sort-imports",
        "prettier-plugin-tailwindcss",
    ],
    printWidth: 80,
    proseWrap: "always",
    semi: true,
    singleQuote: false,
    tabWidth: 4,
    tailwindFunctions: ["cn", "cva"],
    trailingComma: "all",
};

export default config;
