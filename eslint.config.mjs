import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

const tsTypeChecked = tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
        ...config.languageOptions,
        parserOptions: {
            ...config.languageOptions?.parserOptions,
            project: "./tsconfig.json",
            tsconfigRootDir: import.meta.dirname,
        },
    },
}));

export default tseslint.config(
    {
        ignores: ["node_modules", ".next", ".swc", "dist"],
    },
    ...tsTypeChecked,
    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            "@next/next": nextPlugin,
            "jsx-a11y": jsxA11yPlugin,
        },
        rules: {
            ...nextPlugin.configs["core-web-vitals"].rules,
            "@typescript-eslint/consistent-type-imports": "warn",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/ban-ts-comment": "off",
        },
    },
    {
        files: ["**/*.{js,jsx,mjs,cjs}"],
        plugins: {
            "@next/next": nextPlugin,
            "jsx-a11y": jsxA11yPlugin,
        },
        rules: {
            ...nextPlugin.configs["core-web-vitals"].rules,
        },
    }
);
