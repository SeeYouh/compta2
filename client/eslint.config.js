import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: { react },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Marque comme « utilisé » tout identifiant référencé dans du JSX.
      // Sans cette règle, no-unused-vars ne voit pas les usages JSX et signale
      // chaque composant rendu (<Loader />, <UserMenu />…) comme inutilisé.
      'react/jsx-uses-vars': 'error',

      // Aucun varsIgnorePattern : le motif '^[A-Z_]' exemptait tout identifiant
      // à majuscule, donc tous les composants React — ce qui rendait invisible
      // la forme la plus courante de code mort. La règle jsx-uses-vars ci-dessus
      // est ce qui permet de s'en passer sans générer de faux positifs.
      // Seul '^_' reste exempté : c'est la convention explicite « volontairement
      // inutilisé ». Elle ne masque aucun composant, qui sont en PascalCase.
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  },
])
